import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { 
    CreatePengerjaanCommand, 
    SubmitPengerjaanActionCommand, 
    FinishPengerjaanCommand, 
    ResetPengerjaanCommand, 
    ResetPengerjaanTimeCommand, 
    WarnPengerjaanCommand, 
    UnwarnPengerjaanCommand 
} from './pengerjaan.commands';
import { PengerjaanRepository } from '../repository/pengerjaan.repository';
import { PengerjaanAggregate } from '../entities/pengerjaan.aggregate';
import { AcaraService } from '../../acara/acara.service';
import { BadRequestException } from '@nestjs/common';
import { SessionExpiredError, SessionStaleError } from '../errors/pengerjaan.errors';
import { 
    PengerjaanFinishedEvent, 
    PengerjaanResetEvent, 
    PengerjaanTimeResetEvent, 
    PengerjaanWarnedEvent, 
    PengerjaanUnwarnedEvent, 
    PengerjaanActionSubmittedEvent 
} from '../events/pengerjaan.events';

@CommandHandler(CreatePengerjaanCommand)
export class CreatePengerjaanHandler implements ICommandHandler<CreatePengerjaanCommand> {
    constructor(
        private readonly repository: PengerjaanRepository,
        private readonly acaraService: AcaraService,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: CreatePengerjaanCommand): Promise<{ id: string }> {
        const { siswaId, jadwalId, token } = command;
        const jadwal = await this.acaraService.findJadwalById(jadwalId);

        if (jadwal.token !== token) {
            throw new BadRequestException("Invalid token jadwal");
        }

        const timeLimit = this.acaraService.getTimeLimit(jadwal, new Date());
        const id = crypto.randomUUID();
        const aggregate = PengerjaanAggregate.createNew(
            id,
            siswaId,
            jadwalId,
            jadwal.paketSoalId,
            timeLimit
        );

        await this.repository.save(aggregate);
        return { id: aggregate.id };
    }
}

@CommandHandler(SubmitPengerjaanActionCommand)
export class SubmitPengerjaanActionHandler implements ICommandHandler<SubmitPengerjaanActionCommand> {
    constructor(
        private readonly repository: PengerjaanRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: SubmitPengerjaanActionCommand): Promise<void> {
        try {
            const aggregate = await this.repository.findById(command.pengerjaanId);
            
            aggregate.answerQuestion(command.soalId, command.jawaban);
            aggregate.markQuestion(command.soalId, command.marked ?? false);
            
            await this.repository.save(aggregate);

            // Publish event
            this.eventBus.publish(new PengerjaanActionSubmittedEvent(aggregate.id, aggregate.siswaId, command.soalId));
        } catch (err: any) {
            if (err instanceof SessionExpiredError) {
                throw new BadRequestException('Session expired');
            }
            if (err instanceof SessionStaleError) {
                throw new BadRequestException('Session stale');
            }
            throw err;
        }
    }
}

@CommandHandler(FinishPengerjaanCommand)
export class FinishPengerjaanHandler implements ICommandHandler<FinishPengerjaanCommand> {
    constructor(
        private readonly repository: PengerjaanRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: FinishPengerjaanCommand): Promise<void> {
        const aggregate = await this.repository.findById(command.pengerjaanId);
        aggregate.finish();
        await this.repository.save(aggregate);

        this.eventBus.publish(new PengerjaanFinishedEvent(aggregate.id, aggregate.siswaId));
    }
}

@CommandHandler(ResetPengerjaanCommand)
export class ResetPengerjaanHandler implements ICommandHandler<ResetPengerjaanCommand> {
    constructor(
        private readonly repository: PengerjaanRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: ResetPengerjaanCommand): Promise<void> {
        const aggregate = await this.repository.findById(command.pengerjaanId);
        aggregate.reset();
        await this.repository.save(aggregate);

        this.eventBus.publish(new PengerjaanResetEvent(aggregate.id, aggregate.siswaId));
    }
}

@CommandHandler(ResetPengerjaanTimeCommand)
export class ResetPengerjaanTimeHandler implements ICommandHandler<ResetPengerjaanTimeCommand> {
    constructor(
        private readonly repository: PengerjaanRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: ResetPengerjaanTimeCommand): Promise<void> {
        const aggregate = await this.repository.findById(command.pengerjaanId);
        aggregate.resetTime();
        await this.repository.save(aggregate);

        this.eventBus.publish(new PengerjaanTimeResetEvent(aggregate.id, aggregate.siswaId));
    }
}

@CommandHandler(WarnPengerjaanCommand)
export class WarnPengerjaanHandler implements ICommandHandler<WarnPengerjaanCommand> {
    constructor(
        private readonly repository: PengerjaanRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: WarnPengerjaanCommand): Promise<{ id: string; status: string; strike: number }> {
        const aggregate = await this.repository.findById(command.pengerjaanId);
        aggregate.warn();
        await this.repository.save(aggregate);

        this.eventBus.publish(new PengerjaanWarnedEvent(aggregate.id, aggregate.siswaId, aggregate.strike));

        return {
            id: aggregate.id,
            status: aggregate.status,
            strike: aggregate.strike
        };
    }
}

@CommandHandler(UnwarnPengerjaanCommand)
export class UnwarnPengerjaanHandler implements ICommandHandler<UnwarnPengerjaanCommand> {
    constructor(
        private readonly repository: PengerjaanRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: UnwarnPengerjaanCommand): Promise<{ id: string; strike: number }> {
        const aggregate = await this.repository.findById(command.pengerjaanId);
        aggregate.unwarn();
        await this.repository.save(aggregate);

        this.eventBus.publish(new PengerjaanUnwarnedEvent(aggregate.id, aggregate.siswaId));

        return {
            id: aggregate.id,
            strike: aggregate.strike
        };
    }
}

export const CommandHandlers = [
    CreatePengerjaanHandler,
    SubmitPengerjaanActionHandler,
    FinishPengerjaanHandler,
    ResetPengerjaanHandler,
    ResetPengerjaanTimeHandler,
    WarnPengerjaanHandler,
    UnwarnPengerjaanHandler
];
