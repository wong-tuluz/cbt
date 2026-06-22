import { SessionExpiredError, SessionStaleError } from '../errors/pengerjaan.errors';

export interface DomainEvent {
    type: string;
    payload: any;
    createdAt: Date;
}

export class PengerjaanAggregate {
    id!: string;
    siswaId!: string;
    jadwalId!: string;
    paketSoalId!: string;
    materiSoalId!: string | null;
    status!: 'in_progress' | 'finished';
    strike!: number;
    timeLimit!: number;
    startedAt!: Date;
    finishedAt!: Date | null;
    
    // Projections/Internal State representing the current question states
    answers: Map<string, Array<{ jawabanSoalId: string | null; value: string | null }>> = new Map();
    markers: Map<string, boolean> = new Map();

    private uncommittedEvents: DomainEvent[] = [];

    constructor() {}

    static createNew(id: string, siswaId: string, jadwalId: string, paketSoalId: string, timeLimit: number): PengerjaanAggregate {
        const aggregate = new PengerjaanAggregate();
        const payload = {
            id,
            siswaId,
            jadwalId,
            paketSoalId,
            timeLimit,
            startedAt: new Date()
        };
        aggregate.apply({
            type: 'pengerjaan-started',
            payload,
            createdAt: new Date()
        });
        aggregate.uncommittedEvents.push({
            type: 'pengerjaan-started',
            payload,
            createdAt: new Date()
        });
        return aggregate;
    }

    static loadFromHistory(events: DomainEvent[]): PengerjaanAggregate {
        const aggregate = new PengerjaanAggregate();
        aggregate.replayEvents(events);
        return aggregate;
    }

    getUncommittedEvents(): DomainEvent[] {
        return this.uncommittedEvents;
    }

    clearUncommittedEvents() {
        this.uncommittedEvents = [];
    }

    replayEvents(events: DomainEvent[]) {
        for (const event of events) {
            this.apply(event);
        }
    }

    private apply(event: DomainEvent) {
        switch (event.type) {
            case 'pengerjaan-started':
                this.id = event.payload.id;
                this.siswaId = event.payload.siswaId;
                this.jadwalId = event.payload.jadwalId;
                this.paketSoalId = event.payload.paketSoalId;
                this.materiSoalId = event.payload.materiSoalId ?? null;
                this.timeLimit = event.payload.timeLimit;
                this.status = 'in_progress';
                this.strike = 0;
                this.startedAt = new Date(event.payload.startedAt);
                this.finishedAt = null;
                this.answers.clear();
                this.markers.clear();
                break;
            case 'question-answered':
                this.answers.set(event.payload.soalId, event.payload.jawaban);
                break;
            case 'question-marked':
                this.markers.set(event.payload.soalId, event.payload.isMarked);
                break;
            case 'pengerjaan-finished':
                this.status = 'finished';
                this.finishedAt = new Date(event.payload.finishedAt);
                break;
            case 'pengerjaan-reset':
                this.status = 'in_progress';
                this.strike = 0;
                this.finishedAt = null;
                this.startedAt = new Date(event.payload.startedAt);
                this.answers.clear();
                this.markers.clear();
                break;
            case 'pengerjaan-time-reset':
                this.startedAt = new Date(event.payload.startedAt);
                break;
            case 'pengerjaan-warned':
                this.strike = event.payload.strike;
                break;
            case 'pengerjaan-unwarned':
                this.strike = 0;
                break;
        }
    }

    // Commands
    answerQuestion(soalId: string, jawaban: Array<{ jawabanSoalId: string | null; value: string | null }>) {
        this.checkActive();
        const event = {
            type: 'question-answered',
            payload: { soalId, jawaban },
            createdAt: new Date()
        };
        this.apply(event);
        this.uncommittedEvents.push(event);
    }

    markQuestion(soalId: string, isMarked: boolean) {
        this.checkActive();
        const event = {
            type: 'question-marked',
            payload: { soalId, isMarked },
            createdAt: new Date()
        };
        this.apply(event);
        this.uncommittedEvents.push(event);
    }

    finish() {
        if (this.status === 'finished') {
            throw new SessionStaleError('Session already finished');
        }
        const event = {
            type: 'pengerjaan-finished',
            payload: { finishedAt: new Date() },
            createdAt: new Date()
        };
        this.apply(event);
        this.uncommittedEvents.push(event);
    }

    reset() {
        const event = {
            type: 'pengerjaan-reset',
            payload: { startedAt: new Date() },
            createdAt: new Date()
        };
        this.apply(event);
        this.uncommittedEvents.push(event);
    }

    resetTime() {
        const event = {
            type: 'pengerjaan-time-reset',
            payload: { startedAt: new Date() },
            createdAt: new Date()
        };
        this.apply(event);
        this.uncommittedEvents.push(event);
    }

    warn() {
        const newStrike = this.strike + 1;
        const event = {
            type: 'pengerjaan-warned',
            payload: { strike: newStrike },
            createdAt: new Date()
        };
        this.apply(event);
        this.uncommittedEvents.push(event);
    }

    unwarn() {
        const event = {
            type: 'pengerjaan-unwarned',
            payload: { strike: 0 },
            createdAt: new Date()
        };
        this.apply(event);
        this.uncommittedEvents.push(event);
    }

    private checkActive() {
        if (this.status !== 'in_progress') {
            throw new SessionStaleError('Session stale');
        }
        if (this.isExpired()) {
            throw new SessionExpiredError('Session expired');
        }
    }

    isExpired(): boolean {
        if (!this.timeLimit) return false;
        const expiresAt = this.startedAt.getTime() + this.timeLimit * 60 * 1000;
        return new Date().getTime() > expiresAt;
    }
}
