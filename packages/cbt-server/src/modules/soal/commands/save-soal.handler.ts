import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { generateUuidV7 } from '../../../utils/uuid';
import { SaveSoalCommand } from './save-soal.command';
import { SoalRepository } from '../repository/soal.repository';
import { Soal } from '../entities/soal.aggregate';
import { SoalType as DomainSoalType } from '../entities/soal-type.object';
import { Opsi } from '../entities/opsi.entity';
import { SoalSavedEvent } from '../events/soal-saved.event';

@CommandHandler(SaveSoalCommand)
export class SaveSoalHandler implements ICommandHandler<SaveSoalCommand> {
    constructor(
        private readonly repository: SoalRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: SaveSoalCommand): Promise<{ id: string }> {
        let soalAggregate: Soal;
        try {
            const domainSoalType = DomainSoalType.fromString(command.type);
            const opsiList = (command.jawaban ?? []).map((j) =>
                Opsi.create({
                    id: j.id ?? generateUuidV7('soal'),
                    value: j.value,
                    isCorrect: j.isCorrect,
                    order: j.order,
                }),
            );

            soalAggregate = Soal.create({
                id: command.id,
                remoteId: command.remoteId,
                materiSoalId: command.materiSoalId,
                type: domainSoalType,
                prompt: command.prompt,
                order: command.order,
                weightCorrect: command.weightCorrect,
                weightWrong: command.weightWrong,
                opsi: opsiList,
            });
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }

        const soalId = soalAggregate.id;

        // Save to DB
        await this.repository.save(soalAggregate);

        // Emit SoalSavedEvent using CQRS publisher
        const context = this.publisher.mergeObjectContext(soalAggregate);
        context.apply(new SoalSavedEvent(soalId));
        context.commit();

        return { id: soalId };
    }
}
