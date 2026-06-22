import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { db, paketSoalTable, materiSoalTable, soalTable } from 'src/common/db';
import { eq, count } from 'drizzle-orm';
import { SavePaketSoalCommand } from './commands/save-paket-soal.command';

@Injectable()
export class PaketSoalService {
    constructor(
        private readonly commandBus: CommandBus,
    ) { }

    async save(input: {
        id?: string;
        title: string;
        description?: string | null;
        remoteId?: string | null;
        materi?: Array<{
            id?: string;
            title: string;
            description?: string | null;
            order: number;
            timeLimit: number;
            remoteId?: string | null;
        }>;
    }) {
        return this.commandBus.execute(
            new SavePaketSoalCommand(
                input.id,
                input.title,
                input.description,
                input.remoteId,
                input.materi,
            ),
        );
    }

    async delete(id: string) {
        await db
            .delete(paketSoalTable)
            .where(eq(paketSoalTable.id, id));
    }

    async findAll() {
        return db.select().from(paketSoalTable);
    }

    async findById(id: string) {
        const rows = await db
            .select()
            .from(paketSoalTable)
            .where(eq(paketSoalTable.id, id))
            .limit(1);

        const result = rows[0] ?? null;
        if (!result) {
            throw new NotFoundException('Paket soal not found');
        }
        return result;
    }

    async getQuestionCount(id: string) {
        const [result] = await db
            .select({ count: count() })
            .from(soalTable)
            .innerJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
            .where(eq(materiSoalTable.paketSoalId, id));

        return result.count;
    }
}
