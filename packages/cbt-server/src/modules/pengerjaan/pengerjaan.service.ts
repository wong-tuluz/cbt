import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { db, workSessionTable } from "src/common/db";
import { eq, and } from "drizzle-orm";
import { JadwalService } from "../jadwal/jadwal.service";

export type SessionStatus = 'in_progress' | 'finished';

@Injectable()
export class PengerjaanService {
    constructor(
        private readonly jadwalService: JadwalService
    ) { }

    async hasAccess(sessionId: string, siswaId: string) {
        const session = await this.findById(sessionId)
        if (session.siswaId != siswaId)
            throw new BadRequestException("Tidak ada akses")
    }

    async listAll(filter?: {
        siswaId?: string,
        jadwalId?: string,
        status?: SessionStatus
    }) {
        const qFilter = [
            filter?.siswaId ? eq(workSessionTable.siswaId, filter.siswaId) : undefined,
            filter?.jadwalId ? eq(workSessionTable.jadwalId, filter.jadwalId) : undefined,
            filter?.status ? eq(workSessionTable.status, filter.status) : undefined
        ]

        const rows = await db.select()
            .from(workSessionTable)
            .where(and(...qFilter));

        return rows;
    }

    async findById(sessionId: string) {
        const row = await db.select()
            .from(workSessionTable)
            .where(eq(workSessionTable.id, sessionId))
            .limit(1)
            .then(rows => rows[0] ?? null)

        if (!row) throw new NotFoundException();

        return row;
    }

    async create(siswaId: string, jadwalId: string, token: string) {
        const jadwal = await this.jadwalService.findById(jadwalId);

        if (jadwal.token !== token) {
            throw new BadRequestException("Invalid token jadwal")
        }

        const timeLimit = this.jadwalService.getTimeLimit(jadwal, new Date());

        const id = crypto.randomUUID();
        const session = {
            id,
            siswaId,
            jadwalId,
            paketSoalId: jadwal.paketSoalId,
            materiSoalId: null,
            timeLimit,
            status: 'in_progress' as SessionStatus,
            strike: 0,
            startedAt: new Date(),
            finishedAt: null,
        };

        await this.upsert(session);
        return session;
    }

    async finish(sessionId: string) {
        const session = await this.findById(sessionId);
        await db.update(workSessionTable)
            .set({ status: 'finished', finishedAt: new Date(), updatedAt: new Date() })
            .where(eq(workSessionTable.id, sessionId));
    }

    async finishAllByJadwal(jadwalId: string) {
        const sessions = await db.select({ id: workSessionTable.id })
            .from(workSessionTable)
            .where(
                and(
                    eq(workSessionTable.jadwalId, jadwalId),
                    eq(workSessionTable.status, 'in_progress')
                )
            );

        const ids = sessions.map(s => s.id);
        if (ids.length > 0) {
            await db.update(workSessionTable)
                .set({ status: 'finished', finishedAt: new Date(), updatedAt: new Date() })
                .where(
                    and(
                        eq(workSessionTable.jadwalId, jadwalId),
                        eq(workSessionTable.status, 'in_progress')
                    )
                );
        }

        return { success: true, data: { finishedIds: ids }, message: 'Semua ujian berhasil dikumpulkan' };
    }

    async reset(sessionId: string) {
        const now = new Date();
        await db.update(workSessionTable)
            .set({ status: 'in_progress', strike: 0, finishedAt: null, startedAt: now, updatedAt: now })
            .where(eq(workSessionTable.id, sessionId));
    }

    async resetAllByJadwal(jadwalId: string) {
        const now = new Date();
        await db.update(workSessionTable)
            .set({ status: 'in_progress', strike: 0, finishedAt: null, startedAt: now, updatedAt: now })
            .where(eq(workSessionTable.jadwalId, jadwalId));
    }

    async resetTime(sessionId: string) {
        const now = new Date();
        await db.update(workSessionTable)
            .set({ startedAt: now, updatedAt: now })
            .where(eq(workSessionTable.id, sessionId));
    }

    async resetTimeByJadwal(jadwalId: string) {
        const now = new Date();
        await db.update(workSessionTable)
            .set({ startedAt: now, updatedAt: now })
            .where(eq(workSessionTable.jadwalId, jadwalId));
    }

    async warn(sessionId: string) {
        const session = await this.findById(sessionId);
        const newStrike = session.strike + 1;
        await db.update(workSessionTable)
            .set({ strike: newStrike, updatedAt: new Date() })
            .where(eq(workSessionTable.id, sessionId));
        
        return {
            id: session.id,
            status: session.status,
            strike: newStrike,
        };
    }

    async unwarn(sessionId: string) {
        await db.update(workSessionTable)
            .set({ strike: 0, updatedAt: new Date() })
            .where(eq(workSessionTable.id, sessionId));

        return {
            id: sessionId,
            strike: 0,
        };
    }

    private async upsert(session: any) {
        const { id, ...properties } = session;
        await db.insert(workSessionTable)
            .values({ id, ...properties })
            .onDuplicateKeyUpdate({
                set: {
                    ...properties,
                    updatedAt: new Date()
                }
            });
    }

    isExpired(session: { startedAt: Date, timeLimit: number }) {
        if (!session.timeLimit) return false;

        const expiresAt = session.startedAt.getTime() + session.timeLimit * 60 * 1000
        return new Date() > new Date(expiresAt);
    }
}
