import { Injectable } from '@nestjs/common';
import { db, paketSoalTable } from '../../../common/db';
import { PaketSoal } from '../entities/paket-soal.aggregate';

@Injectable()
export class PaketSoalRepository {
    async save(paketSoal: PaketSoal): Promise<PaketSoal> {
        const payload = {
            id: paketSoal.id,
            remoteId: paketSoal.remoteId,
            title: paketSoal.title,
            description: paketSoal.description ?? null,
        };

        await db.insert(paketSoalTable).values(payload).onDuplicateKeyUpdate({
            set: {
                remoteId: payload.remoteId,
                title: payload.title,
                description: payload.description,
                updatedAt: new Date(),
            }
        });

        return paketSoal;
    }
}
