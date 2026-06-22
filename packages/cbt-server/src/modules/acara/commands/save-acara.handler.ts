import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { SaveAcaraCommand } from './save-acara.command';
import { AcaraRepository } from '../repository/acara.repository';
import { Acara } from '../entities/acara.aggregate';
import { AcaraSavedEvent } from '../events/acara-saved.event';

@CommandHandler(SaveAcaraCommand)
export class SaveAcaraHandler implements ICommandHandler<SaveAcaraCommand> {
    constructor(
        private readonly repository: AcaraRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: SaveAcaraCommand): Promise<{ id: string }> {
        let aggregate: Acara | null = null;
        if (command.id) {
            aggregate = await this.repository.findById(command.id);
        }

        if (aggregate) {
            aggregate.updateTitle(command.title);
            aggregate.updateDescription(command.description);
            aggregate.updateTimeRange(command.startTime, command.endTime);
        } else {
            aggregate = Acara.create({
                id: command.id,
                remoteId: command.remoteId,
                title: command.title,
                description: command.description,
                startTime: command.startTime,
                endTime: command.endTime,
            });
        }

        if (command.jadwals !== undefined) {
            for (const j of command.jadwals) {
                aggregate.addOrUpdateJadwal(j);
            }
        }

        await this.repository.save(aggregate);

        const context = this.publisher.mergeObjectContext(aggregate);
        context.apply(new AcaraSavedEvent(aggregate.id));
        context.commit();

        return { id: aggregate.id };
    }
}
