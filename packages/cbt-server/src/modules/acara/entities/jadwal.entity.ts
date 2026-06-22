import { generateUuidV7 } from '../../../utils/uuid';
import {
    EmptyTitleJadwalError,
    NegativeTimeLimitJadwalError,
    NegativeAttemptsJadwalError,
} from '../errors/acara.errors';

export interface JadwalProps {
    id: string;
    paketSoalId: string;
    title: string;
    startTime: Date;
    endTime: Date;
    timeLimit: number;
    attempts: number;
    token: string;
    remoteId?: string | null;
}

export class Jadwal {
    private constructor(private readonly props: JadwalProps) {}

    public static create(props: {
        id?: string;
        paketSoalId: string;
        title: string;
        startTime: Date;
        endTime: Date;
        timeLimit: number;
        attempts: number;
        token: string;
        remoteId?: string | null;
    }): Jadwal {
        if (!props.title || props.title.trim() === '') {
            throw new EmptyTitleJadwalError();
        }
        if (props.timeLimit < 0) {
            throw new NegativeTimeLimitJadwalError();
        }
        if (props.attempts <= 0) {
            throw new NegativeAttemptsJadwalError();
        }
        return new Jadwal({
            ...props,
            id: props.id ?? generateUuidV7('jadwal'),
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get paketSoalId(): string {
        return this.props.paketSoalId;
    }

    public get title(): string {
        return this.props.title;
    }

    public get startTime(): Date {
        return this.props.startTime;
    }

    public get endTime(): Date {
        return this.props.endTime;
    }

    public get timeLimit(): number {
        return this.props.timeLimit;
    }

    public get attempts(): number {
        return this.props.attempts;
    }

    public get token(): string {
        return this.props.token;
    }

    public get remoteId(): string | undefined | null {
        return this.props.remoteId;
    }

    public updateTitle(title: string): void {
        if (!title || title.trim() === '') {
            throw new EmptyTitleJadwalError();
        }
        this.props.title = title;
    }

    public updateTimeLimit(timeLimit: number): void {
        if (timeLimit < 0) {
            throw new NegativeTimeLimitJadwalError();
        }
        this.props.timeLimit = timeLimit;
    }

    public updateAttempts(attempts: number): void {
        if (attempts <= 0) {
            throw new NegativeAttemptsJadwalError();
        }
        this.props.attempts = attempts;
    }

    public updateTimeRange(startTime: Date, endTime: Date): void {
        this.props.startTime = startTime;
        this.props.endTime = endTime;
    }

    public updatePaketSoalId(paketSoalId: string): void {
        this.props.paketSoalId = paketSoalId;
    }

    public updateToken(token: string): void {
        this.props.token = token;
    }

    public updateRemoteId(remoteId?: string | null): void {
        this.props.remoteId = remoteId;
    }
}
