import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db, pengerjaanTable, jadwalTable } from 'src/common/db';
import { eq, and, sql, lt, or } from 'drizzle-orm';
import { PengerjaanRepository } from './repository/pengerjaan.repository';

@Injectable()
export class PengerjaanCronService {
  private readonly logger = new Logger(PengerjaanCronService.name);

  constructor(
    private readonly pengerjaanRepository: PengerjaanRepository
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running auto-finish work sessions cron job');

    try {
      const now = new Date();

      const expiredSessions = await db.select({ id: pengerjaanTable.id })
        .from(pengerjaanTable)
        .innerJoin(jadwalTable, eq(pengerjaanTable.jadwalId, jadwalTable.id))
        .where(
          and(
            eq(pengerjaanTable.status, 'in_progress'),
            or(
              sql`DATE_ADD(${pengerjaanTable.startedAt}, INTERVAL ${pengerjaanTable.timeLimit} MINUTE) < ${now}`,
              lt(jadwalTable.endTime, now)
            )
          )
        );

      if (expiredSessions.length > 0) {
        const ids = expiredSessions.map(s => s.id);
        this.logger.log(`Finishing ${ids.length} expired sessions: ${ids.join(', ')}`);

        for (const id of ids) {
          try {
            const aggregate = await this.pengerjaanRepository.findById(id);
            aggregate.finish();
            await this.pengerjaanRepository.save(aggregate);
          } catch (err) {
            this.logger.error(`Failed to auto-finish session ${id}`, err);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in auto-finish cron job', error);
    }
  }
}
