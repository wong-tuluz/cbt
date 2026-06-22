import { Injectable, NotFoundException } from '@nestjs/common';
import { db, pengerjaanTable, pengerjaanJawabanTable, pengerjaanMarkerTable, pengerjaanEventTable } from 'src/common/db';
import { eq, and, asc } from 'drizzle-orm';
import { PengerjaanAggregate } from '../entities/pengerjaan.aggregate';

@Injectable()
export class PengerjaanRepository {
    async findById(id: string): Promise<PengerjaanAggregate> {
        const events = await db.select()
            .from(pengerjaanEventTable)
            .where(eq(pengerjaanEventTable.pengerjaanId, id))
            .orderBy(asc(pengerjaanEventTable.createdAt));

        if (events.length === 0) {
            throw new NotFoundException('Pengerjaan session not found');
        }

        const domainEvents = events.map(e => ({
            type: e.eventType,
            payload: JSON.parse(e.payload),
            createdAt: e.createdAt
        }));

        return PengerjaanAggregate.loadFromHistory(domainEvents);
    }

    async getEvents(id: string) {
        const events = await db.select()
            .from(pengerjaanEventTable)
            .where(eq(pengerjaanEventTable.pengerjaanId, id))
            .orderBy(asc(pengerjaanEventTable.createdAt));

        return events.map(e => ({
            id: e.id,
            pengerjaanId: e.pengerjaanId,
            eventType: e.eventType,
            payload: JSON.parse(e.payload),
            createdAt: e.createdAt
        }));
    }

    async save(aggregate: PengerjaanAggregate): Promise<void> {
        const uncommittedEvents = aggregate.getUncommittedEvents();
        if (uncommittedEvents.length === 0) {
            return;
        }

        const MAX_DEADLOCK_RETRIES = 3;
        let attempt = 0;

        while (true) {
            try {
                await db.transaction(async tx => {
                    for (const event of uncommittedEvents) {
                        // 1. Save event log
                        await tx.insert(pengerjaanEventTable).values({
                            id: crypto.randomUUID(),
                            pengerjaanId: aggregate.id,
                            eventType: event.type,
                            payload: JSON.stringify(event.payload),
                            createdAt: event.createdAt
                        });

                        // 2. Apply projection to write-through read models
                        switch (event.type) {
                            case 'pengerjaan-started': {
                                await tx.insert(pengerjaanTable).values({
                                    id: event.payload.id,
                                    siswaId: event.payload.siswaId,
                                    jadwalId: event.payload.jadwalId,
                                    paketSoalId: event.payload.paketSoalId,
                                    materiSoalId: event.payload.materiSoalId ?? null,
                                    status: 'in_progress',
                                    strike: 0,
                                    timeLimit: event.payload.timeLimit,
                                    startedAt: new Date(event.payload.startedAt),
                                    finishedAt: null,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                });
                                break;
                            }
                            case 'question-answered': {
                                await tx.delete(pengerjaanJawabanTable).where(and(
                                    eq(pengerjaanJawabanTable.pengerjaanId, aggregate.id),
                                    eq(pengerjaanJawabanTable.soalId, event.payload.soalId)
                                ));
                                if (event.payload.jawaban.length > 0) {
                                    await tx.insert(pengerjaanJawabanTable).values(
                                        event.payload.jawaban.map((x: any) => ({
                                            id: crypto.randomUUID(),
                                            pengerjaanId: aggregate.id,
                                            soalId: event.payload.soalId,
                                            jawabanSoalId: x.jawabanSoalId,
                                            value: x.value,
                                            createdAt: new Date()
                                        }))
                                    );
                                }
                                break;
                            }
                            case 'question-marked': {
                                await tx.delete(pengerjaanMarkerTable).where(and(
                                    eq(pengerjaanMarkerTable.pengerjaanId, aggregate.id),
                                    eq(pengerjaanMarkerTable.soalId, event.payload.soalId)
                                ));
                                await tx.insert(pengerjaanMarkerTable).values({
                                    id: crypto.randomUUID(),
                                    pengerjaanId: aggregate.id,
                                    soalId: event.payload.soalId,
                                    isMarked: event.payload.isMarked
                                });
                                break;
                            }
                            case 'pengerjaan-finished': {
                                await tx.update(pengerjaanTable)
                                    .set({
                                        status: 'finished',
                                        finishedAt: new Date(event.payload.finishedAt),
                                        updatedAt: new Date()
                                    })
                                    .where(eq(pengerjaanTable.id, aggregate.id));
                                break;
                            }
                            case 'pengerjaan-reset': {
                                await tx.update(pengerjaanTable)
                                    .set({
                                        status: 'in_progress',
                                        strike: 0,
                                        finishedAt: null,
                                        startedAt: new Date(event.payload.startedAt),
                                        updatedAt: new Date()
                                    })
                                    .where(eq(pengerjaanTable.id, aggregate.id));

                                // Clean projections for answers and markers on reset
                                await tx.delete(pengerjaanJawabanTable).where(eq(pengerjaanJawabanTable.pengerjaanId, aggregate.id));
                                await tx.delete(pengerjaanMarkerTable).where(eq(pengerjaanMarkerTable.pengerjaanId, aggregate.id));
                                break;
                            }
                            case 'pengerjaan-time-reset': {
                                await tx.update(pengerjaanTable)
                                    .set({
                                        startedAt: new Date(event.payload.startedAt),
                                        updatedAt: new Date()
                                    })
                                    .where(eq(pengerjaanTable.id, aggregate.id));
                                break;
                            }
                            case 'pengerjaan-warned': {
                                await tx.update(pengerjaanTable)
                                    .set({
                                        strike: event.payload.strike,
                                        updatedAt: new Date()
                                    })
                                    .where(eq(pengerjaanTable.id, aggregate.id));
                                break;
                            }
                            case 'pengerjaan-unwarned': {
                                await tx.update(pengerjaanTable)
                                    .set({
                                        strike: 0,
                                        updatedAt: new Date()
                                    })
                                    .where(eq(pengerjaanTable.id, aggregate.id));
                                break;
                            }
                        }
                    }
                });
                break; // success
            } catch (err: any) {
                if (err?.code === 'ER_LOCK_DEADLOCK' && attempt < MAX_DEADLOCK_RETRIES) {
                    attempt++;
                    await new Promise(r => setTimeout(r, 50 * attempt));
                    continue;
                }
                throw err;
            }
        }

        aggregate.clearUncommittedEvents();
    }
}
