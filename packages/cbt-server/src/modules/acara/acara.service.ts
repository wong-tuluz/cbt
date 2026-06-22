import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { db, acaraTable, acaraSiswaTable, jadwalTable, soalTable, materiSoalTable, pengerjaanTable } from 'src/common/db';
import { eq, and, exists, count } from 'drizzle-orm';
import { SaveAcaraCommand } from './commands/save-acara.command';
import { AcaraRepository } from './repository/acara.repository';
import { PaketSoalService } from '../paket-soal/paket-soal.service';
import { SettingService } from '../settings/settings.service';

@Injectable()
export class AcaraService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly repository: AcaraRepository,
        private readonly paketsoalService: PaketSoalService,
        private readonly settings: SettingService,
    ) { }

    async listAll(filter?: { siswaId?: string }) {
        const rows = await db.select()
            .from(acaraTable)
            .where(and(...[
                filter?.siswaId ? exists(
                    db.select().from(acaraSiswaTable)
                        .where(and(
                            eq(acaraSiswaTable.siswaId, filter.siswaId),
                            eq(acaraSiswaTable.acaraId, acaraTable.id),
                        )),
                ) : undefined
            ]));

        return rows;
    }

    async findById(id: string) {
        const row = await db.select().from(acaraTable)
            .where(eq(acaraTable.id, id))
            .limit(1)
            .then(rows => rows[0]);

        if (!row) throw new NotFoundException('Acara not found');

        return row;
    }

    async listSiswa(acaraId: string) {
        const rows = await db.select().from(acaraSiswaTable)
            .where(eq(acaraSiswaTable.acaraId, acaraId));

        return rows;
    }

    async save(input: {
        id?: string;
        title: string;
        description?: string | null;
        startTime: Date;
        endTime: Date;
        remoteId?: string | null;
        jadwals?: Array<{
            id?: string;
            paketSoalId: string;
            title: string;
            startTime: Date;
            endTime: Date;
            timeLimit: number;
            attempts: number;
            token: string;
            remoteId?: string | null;
        }>;
    }) {
        return this.commandBus.execute(
            new SaveAcaraCommand(
                input.id,
                input.title,
                input.startTime,
                input.endTime,
                input.description,
                input.remoteId,
                input.jadwals,
            ),
        );
    }

    async addSiswa(acaraId: string, siswaId: string, remoteId?: string, id?: string) {
        await db.insert(acaraSiswaTable).values({
            id: id ?? crypto.randomUUID(),
            acaraId,
            siswaId,
            remoteId,
        }).onDuplicateKeyUpdate({
            set: { acaraId, siswaId, remoteId, updatedAt: new Date() },
        });
    }

    // Replace legacy JadwalService.listAll
    async listAllJadwal(filter?: {
        siswaId?: string;
        acaraId?: string;
    }) {
        const rows = await db.select()
            .from(jadwalTable)
            .where(and(...[
                filter?.acaraId ? eq(jadwalTable.acaraId, filter.acaraId) : undefined,
                filter?.siswaId ? exists(db
                    .select()
                    .from(acaraSiswaTable)
                    .where(and(
                        eq(acaraSiswaTable.siswaId, filter.siswaId),
                        eq(acaraSiswaTable.acaraId, jadwalTable.acaraId),
                    )),
                ) : undefined
            ]));

        return Promise.all(rows.map(async row => {
            const questionCount = await this.getQuestionCount(row.paketSoalId);
            const attemptCount = filter?.siswaId ? await this.getAttemptedCount(filter.siswaId, row.id) : 0;
            const acara = await this.findById(row.acaraId);
            const paketsoal = await this.paketsoalService.findById(row.paketSoalId);
            const hasil = await this.showHasil();

            return {
                ...row,
                jadwalId: row.id,
                questionCount,
                attemptsRemaining: row.attempts - attemptCount,
                status: attemptCount > 0 ? 'attempted' : 'no-attempts',
                viewHasil: hasil,
                acara: acara,
                agenda: acara, // Frontend backward-compatibility mapping
                paketSoal: paketsoal,
            };
        }));
    }

    async findJadwalById(jadwalId: string) {
        const row = await db.select().from(jadwalTable).where(eq(jadwalTable.id, jadwalId)).limit(1).then(rows => rows[0]);
        if (!row) throw new NotFoundException('Jadwal not found');

        return row;
    }

    async saveJadwal(acaraId: string, input: {
        id?: string;
        paketSoalId: string;
        title: string;
        startTime: Date;
        endTime: Date;
        timeLimit: number;
        attempts: number;
        token: string;
        remoteId?: string | null;
    }) {
        const acara = await this.repository.findById(acaraId);
        if (!acara) {
            throw new NotFoundException('Acara not found');
        }

        const jadwal = acara.addOrUpdateJadwal(input);
        await this.repository.save(acara);

        return { id: jadwal.id };
    }

    async deleteJadwal(acaraId: string, jadwalId: string) {
        const acara = await this.repository.findById(acaraId);
        if (acara) {
            acara.removeJadwal(jadwalId);
            await this.repository.save(acara);
        }
    }

    private async showHasil(): Promise<boolean> {
        return (await this.settings.fetch<{ showHasil: boolean }>())?.showHasil ?? false;
    }

    private async getQuestionCount(paketSoalId: string) {
        const [result] = await db
            .select({ count: count() })
            .from(soalTable)
            .innerJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
            .where(eq(materiSoalTable.paketSoalId, paketSoalId));

        return result?.count ?? 0;
    }

    private async getAttemptedCount(siswaId: string, jadwalId: string): Promise<number> {
        const rows = await db.select().from(pengerjaanTable)
            .where(and(
                eq(pengerjaanTable.jadwalId, jadwalId),
                eq(pengerjaanTable.siswaId, siswaId),
                eq(pengerjaanTable.status, 'finished'),
            ));

        return rows.length;
    }

    getTimeLimit(jadwal: { timeLimit: number; endTime: Date }, date: Date): number {
        const expiresAt = date.getTime() + jadwal.timeLimit * 60 * 1000;

        let res = 0;
        if (new Date(expiresAt) < jadwal.endTime) {
            res = (expiresAt - new Date().getTime()) / 1000 / 60;
        } else {
            res = (jadwal.endTime.getTime() - new Date().getTime()) / 1000 / 60;
        }

        return res;
    }
}
