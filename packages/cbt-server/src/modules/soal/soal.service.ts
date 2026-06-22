import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { db, soalTable, jawabanSoalTable } from 'src/common/db';
import { eq, asc } from 'drizzle-orm';
import { CommandBus } from '@nestjs/cqrs';
import { SaveSoalCommand } from './commands/save-soal.command';

export type SoalType = 'multiple-choice' | 'essay' | 'single-choice';

@Injectable()
export class SoalService {
    constructor(
        private readonly commandBus: CommandBus,
    ) { }

    async save(input: {
        id?: string;
        materiSoalId: string;
        type: SoalType;
        prompt: string;
        order: number;
        weightCorrect: number;
        weightWrong: number;
        remoteId?: string | null;
        jawaban?: Array<{
            id?: string;
            value: string;
            isCorrect: boolean;
            order: number;
        }>;
    }) {
        return this.commandBus.execute(
            new SaveSoalCommand(
                input.id,
                input.materiSoalId,
                input.type,
                input.prompt,
                input.order,
                input.weightCorrect,
                input.weightWrong,
                input.remoteId,
                input.jawaban,
            ),
        );
    }

    async delete(soalId: string) {
        await db.transaction(async (tx) => {
            await tx
                .delete(jawabanSoalTable)
                .where(eq(jawabanSoalTable.soalId, soalId));

            await tx.delete(soalTable).where(eq(soalTable.id, soalId));
        });
    }

    async findByMateriSoalId(materiSoalId: string) {
        return db
            .select()
            .from(soalTable)
            .where(eq(soalTable.materiSoalId, materiSoalId))
            .orderBy(asc(soalTable.order));
    }

    async findById(id: string) {
        const rows = await db
            .select()
            .from(soalTable)
            .where(eq(soalTable.id, id))
            .limit(1);

        return rows[0] ?? null;
    }

    async findByIdWithJawaban(soalId: string) {
        const rows = await db
            .select({
                soal: soalTable,
                jawaban: jawabanSoalTable,
            })
            .from(soalTable)
            .leftJoin(
                jawabanSoalTable,
                eq(jawabanSoalTable.soalId, soalTable.id),
            )
            .where(eq(soalTable.id, soalId))
            .orderBy(asc(jawabanSoalTable.order));

        if (rows.length === 0) return null;

        return {
            ...rows[0].soal,
            jawaban: rows
                .filter((r) => r.jawaban !== null)
                .map((r) => r.jawaban!),
        };
    }

    async getJawaban(soalId: string) {
        return db
            .select()
            .from(jawabanSoalTable)
            .where(eq(jawabanSoalTable.soalId, soalId))
            .orderBy(asc(jawabanSoalTable.order));
    }
}
