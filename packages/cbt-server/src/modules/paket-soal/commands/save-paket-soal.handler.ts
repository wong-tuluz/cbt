import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { SavePaketSoalCommand } from './save-paket-soal.command';
import { PaketSoalRepository } from '../repository/paket-soal.repository';
import { PaketSoal } from '../entities/paket-soal.aggregate';
import { PaketSoalSavedEvent } from '../events/paket-soal-saved.event';

@CommandHandler(SavePaketSoalCommand)
export class SavePaketSoalHandler implements ICommandHandler<SavePaketSoalCommand> {
    constructor(
        private readonly repository: PaketSoalRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: SavePaketSoalCommand): Promise<{ id: string }> {
        const aggregate = PaketSoal.create({
            id: command.id,
            remoteId: command.remoteId,
            title: command.title,
            description: command.description,
        });

        await this.repository.save(aggregate);

        const context = this.publisher.mergeObjectContext(aggregate);
        context.apply(new PaketSoalSavedEvent(aggregate.id));
        context.commit();

        return { id: aggregate.id };
    }
}
