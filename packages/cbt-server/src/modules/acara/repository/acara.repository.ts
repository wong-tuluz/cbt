import { Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { db, acaraTable, jadwalTable } from '../../../common/db';
import { Acara } from '../entities/acara.aggregate';
import { Jadwal } from '../entities/jadwal.entity';

@Injectable()
export class AcaraRepository {
    async findById(id: string): Promise<Acara | null> {
        const rows = await db
            .select()
            .from(acaraTable)
            .where(eq(acaraTable.id, id))
            .limit(1);

        if (rows.length === 0) return null;

        const rawAcara = rows[0];

        const rawJadwal = await db
            .select()
            .from(jadwalTable)
            .where(eq(jadwalTable.acaraId, id))
            .orderBy(asc(jadwalTable.startTime));

        const jadwalEntities = rawJadwal.map((j) =>
            Jadwal.create({
                id: j.id,
                paketSoalId: j.paketSoalId,
                title: j.title,
                startTime: j.startTime,
                endTime: j.endTime,
                timeLimit: j.timeLimit,
                attempts: j.attempts,
                token: j.token,
                remoteId: j.remoteId,
            }),
        );

        return Acara.create({
            id: rawAcara.id,
            title: rawAcara.title,
            description: rawAcara.description,
            remoteId: rawAcara.remoteId,
            startTime: rawAcara.startTime,
            endTime: rawAcara.endTime,
            jadwals: jadwalEntities,
        });
    }

    async save(acara: Acara): Promise<Acara> {
        const payload = {
            id: acara.id,
            remoteId: acara.remoteId,
            title: acara.title,
            description: acara.description ?? '',
            startTime: acara.startTime,
            endTime: acara.endTime,
        };

        await db.transaction(async (tx) => {
            // 1. Save/Upsert Acara
            await tx.insert(acaraTable).values(payload).onDuplicateKeyUpdate({
                set: {
                    remoteId: payload.remoteId,
                    title: payload.title,
                    description: payload.description,
                    startTime: payload.startTime,
                    endTime: payload.endTime,
                    updatedAt: new Date(),
                }
            });

            // 2. Load existing Jadwal IDs in DB to handle deletion
            const existingJadwal = await tx
                .select({ id: jadwalTable.id })
                .from(jadwalTable)
                .where(eq(jadwalTable.acaraId, acara.id));

            const dbJadwalIds = existingJadwal.map((j) => j.id);
            const aggregateJadwalIds = acara.jadwals.map((j) => j.id);

            // 3. Delete Jadwal that are no longer part of the aggregate
            const toDeleteIds = dbJadwalIds.filter((id) => !aggregateJadwalIds.includes(id));
            for (const deleteId of toDeleteIds) {
                await tx.delete(jadwalTable).where(eq(jadwalTable.id, deleteId));
            }

            // 4. Upsert current Jadwal list
            for (const j of acara.jadwals) {
                const jPayload = {
                    id: j.id,
                    acaraId: acara.id,
                    paketSoalId: j.paketSoalId,
                    title: j.title,
                    startTime: j.startTime,
                    endTime: j.endTime,
                    timeLimit: j.timeLimit,
                    attempts: j.attempts,
                    token: j.token,
                    remoteId: j.remoteId,
                };

                await tx.insert(jadwalTable).values(jPayload).onDuplicateKeyUpdate({
                    set: {
                        acaraId: jPayload.acaraId,
                        paketSoalId: jPayload.paketSoalId,
                        title: jPayload.title,
                        startTime: jPayload.startTime,
                        endTime: jPayload.endTime,
                        timeLimit: jPayload.timeLimit,
                        attempts: jPayload.attempts,
                        token: jPayload.token,
                        remoteId: jPayload.remoteId,
                        updatedAt: new Date(),
                    }
                });
            }
        });

        return acara;
    }
}
