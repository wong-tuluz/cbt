import { Injectable } from '@nestjs/common';
import { db, soalTable, jawabanSoalTable } from '../../../common/db';
import { eq } from 'drizzle-orm';
import { Soal } from '../entities/soal.aggregate';

@Injectable()
export class SoalRepository {
    async save(soal: Soal): Promise<Soal> {
        const payload = {
            id: soal.id,
            remoteId: soal.remoteId,
            materiSoalId: soal.materiSoalId,
            type: soal.type.toDbValue(),
            prompt: soal.prompt,
            order: soal.order,
            weightCorrect: soal.weightCorrect,
            weightWrong: soal.weightWrong,
        };

        await db.transaction(async (tx) => {
            await tx.insert(soalTable).values(payload).onDuplicateKeyUpdate({
                set: {
                    remoteId: payload.remoteId,
                    materiSoalId: payload.materiSoalId,
                    type: payload.type,
                    prompt: payload.prompt,
                    order: payload.order,
                    weightCorrect: payload.weightCorrect,
                    weightWrong: payload.weightWrong,
                    updatedAt: new Date(),
                }
            });

            await tx.delete(jawabanSoalTable).where(eq(jawabanSoalTable.soalId, soal.id));

            if (soal.opsi.length > 0) {
                await tx.insert(jawabanSoalTable).values(
                    soal.opsi.map((o) => ({
                        id: o.id,
                        soalId: soal.id,
                        value: o.value,
                        isCorrect: o.isCorrect,
                        order: o.order,
                    })),
                );
            }
        });

        return soal;
    }
}
