import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { db, pengerjaanTable } from "src/common/db";
import { eq, and } from "drizzle-orm";
import { 
    CreatePengerjaanCommand, 
    FinishPengerjaanCommand, 
    ResetPengerjaanCommand, 
    ResetPengerjaanTimeCommand, 
    WarnPengerjaanCommand, 
    UnwarnPengerjaanCommand 
} from "./commands/pengerjaan.commands";

export type SessionStatus = 'in_progress' | 'finished';

@Injectable()
export class PengerjaanService {
    constructor(
        private readonly commandBus: CommandBus,
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
            filter?.siswaId ? eq(pengerjaanTable.siswaId, filter.siswaId) : undefined,
            filter?.jadwalId ? eq(pengerjaanTable.jadwalId, filter.jadwalId) : undefined,
            filter?.status ? eq(pengerjaanTable.status, filter.status) : undefined
        ]

        const rows = await db.select()
            .from(pengerjaanTable)
            .where(and(...qFilter));

        return rows;
    }

    async findById(sessionId: string) {
        const row = await db.select()
            .from(pengerjaanTable)
            .where(eq(pengerjaanTable.id, sessionId))
            .limit(1)
            .then(rows => rows[0] ?? null)

        if (!row) throw new NotFoundException();

        return row;
    }

    async create(siswaId: string, jadwalId: string, token: string) {
        const { id } = await this.commandBus.execute(
            new CreatePengerjaanCommand(siswaId, jadwalId, token)
        );
        return this.findById(id);
    }

    async finish(sessionId: string) {
        await this.commandBus.execute(new FinishPengerjaanCommand(sessionId));
    }

    async reset(sessionId: string) {
        await this.commandBus.execute(new ResetPengerjaanCommand(sessionId));
    }

    async resetAllByJadwal(jadwalId: string) {
        const sessions = await db.select({ id: pengerjaanTable.id })
            .from(pengerjaanTable)
            .where(eq(pengerjaanTable.jadwalId, jadwalId));

        for (const s of sessions) {
            await this.commandBus.execute(new ResetPengerjaanCommand(s.id));
        }
    }

    async resetTime(sessionId: string) {
        await this.commandBus.execute(new ResetPengerjaanTimeCommand(sessionId));
    }

    async resetTimeByJadwal(jadwalId: string) {
        const sessions = await db.select({ id: pengerjaanTable.id })
            .from(pengerjaanTable)
            .where(eq(pengerjaanTable.jadwalId, jadwalId));

        for (const s of sessions) {
            await this.commandBus.execute(new ResetPengerjaanTimeCommand(s.id));
        }
    }

    async warn(sessionId: string) {
        return await this.commandBus.execute(new WarnPengerjaanCommand(sessionId));
    }

    async unwarn(sessionId: string) {
        return await this.commandBus.execute(new UnwarnPengerjaanCommand(sessionId));
    }

    isExpired(session: { startedAt: Date, timeLimit: number }) {
        if (!session.timeLimit) return false;

        const expiresAt = session.startedAt.getTime() + session.timeLimit * 60 * 1000
        return new Date() > new Date(expiresAt);
    }
}
