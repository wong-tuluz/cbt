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
        let aggregate: PaketSoal | null = null;
        if (command.id) {
            aggregate = await this.repository.findById(command.id);
        }

        if (aggregate) {
            aggregate.updateTitle(command.title);
            aggregate.updateDescription(command.description);
        } else {
            aggregate = PaketSoal.create({
                id: command.id,
                remoteId: command.remoteId,
                title: command.title,
                description: command.description,
            });
        }

        if (command.materi !== undefined) {
            // Replace the entire child list
            const existingIds = aggregate.materi.map((m) => m.id);
            for (const id of existingIds) {
                aggregate.removeMateri(id);
            }
            for (const m of command.materi) {
                aggregate.addOrUpdateMateri(m);
            }
        }

        await this.repository.save(aggregate);

        const context = this.publisher.mergeObjectContext(aggregate);
        context.apply(new PaketSoalSavedEvent(aggregate.id));
        context.commit();

        return { id: aggregate.id };
    }
}
