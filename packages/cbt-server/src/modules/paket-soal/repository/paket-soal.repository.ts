import { Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { db, paketSoalTable, materiSoalTable } from '../../../common/db';
import { PaketSoal } from '../entities/paket-soal.aggregate';
import { Materi } from '../entities/materi.entity';

@Injectable()
export class PaketSoalRepository {
    async findById(id: string): Promise<PaketSoal | null> {
        const rows = await db
            .select()
            .from(paketSoalTable)
            .where(eq(paketSoalTable.id, id))
            .limit(1);

        if (rows.length === 0) return null;

        const rawPaket = rows[0];

        const rawMateri = await db
            .select()
            .from(materiSoalTable)
            .where(eq(materiSoalTable.paketSoalId, id))
            .orderBy(asc(materiSoalTable.order));

        const materiEntities = rawMateri.map((m) =>
            Materi.create({
                id: m.id,
                title: m.title,
                description: m.description,
                order: m.order,
                timeLimit: m.timeLimit,
                remoteId: m.remoteId,
            }),
        );

        return PaketSoal.create({
            id: rawPaket.id,
            title: rawPaket.title,
            description: rawPaket.description,
            remoteId: rawPaket.remoteId,
            materi: materiEntities,
        });
    }

    async save(paketSoal: PaketSoal): Promise<PaketSoal> {
        const payload = {
            id: paketSoal.id,
            remoteId: paketSoal.remoteId,
            title: paketSoal.title,
            description: paketSoal.description ?? null,
        };

        await db.transaction(async (tx) => {
            // 1. Save/Upsert PaketSoal
            await tx.insert(paketSoalTable).values(payload).onDuplicateKeyUpdate({
                set: {
                    remoteId: payload.remoteId,
                    title: payload.title,
                    description: payload.description,
                    updatedAt: new Date(),
                }
            });

            // 2. Load existing Materi IDs in DB to handle deletion
            const existingMateri = await tx
                .select({ id: materiSoalTable.id })
                .from(materiSoalTable)
                .where(eq(materiSoalTable.paketSoalId, paketSoal.id));
            
            const dbMateriIds = existingMateri.map((m) => m.id);
            const aggregateMateriIds = paketSoal.materi.map((m) => m.id);

            // 3. Delete Materi that are no longer part of the aggregate
            const toDeleteIds = dbMateriIds.filter((id) => !aggregateMateriIds.includes(id));
            for (const deleteId of toDeleteIds) {
                await tx.delete(materiSoalTable).where(eq(materiSoalTable.id, deleteId));
            }

            // 4. Upsert current Materi list
            for (const m of paketSoal.materi) {
                const mPayload = {
                    id: m.id,
                    paketSoalId: paketSoal.id,
                    title: m.title,
                    description: m.description ?? null,
                    order: m.order,
                    timeLimit: m.timeLimit,
                    remoteId: m.remoteId,
                };

                await tx.insert(materiSoalTable).values(mPayload).onDuplicateKeyUpdate({
                    set: {
                        paketSoalId: mPayload.paketSoalId,
                        title: mPayload.title,
                        description: mPayload.description,
                        order: mPayload.order,
                        timeLimit: mPayload.timeLimit,
                        remoteId: mPayload.remoteId,
                        updatedAt: new Date(),
                    }
                });
            }
        });

        return paketSoal;
    }
}
