import { AggregateRoot } from '@nestjs/cqrs';
import { generateUuidV7 } from '../../../utils/uuid';
import { EmptyTitleAcaraError, InvalidTimeRangeAcaraError } from '../errors/acara.errors';
import { Jadwal } from './jadwal.entity';

export interface AcaraProps {
    id: string;
    remoteId?: string | null;
    title: string;
    description?: string | null;
    startTime: Date;
    endTime: Date;
    jadwals: Jadwal[];
}

export class Acara extends AggregateRoot {
    private constructor(private readonly props: AcaraProps) {
        super();
        this.validate();
    }

    public static create(props: {
        id?: string;
        remoteId?: string | null;
        title: string;
        description?: string | null;
        startTime: Date;
        endTime: Date;
        jadwals?: Jadwal[];
    }): Acara {
        return new Acara({
            ...props,
            id: props.id ?? generateUuidV7('acara'),
            jadwals: props.jadwals ?? [],
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get remoteId(): string | undefined | null {
        return this.props.remoteId;
    }

    public get title(): string {
        return this.props.title;
    }

    public get description(): string | undefined | null {
        return this.props.description;
    }

    public get startTime(): Date {
        return this.props.startTime;
    }

    public get endTime(): Date {
        return this.props.endTime;
    }

    public get jadwals(): Jadwal[] {
        return [...this.props.jadwals];
    }

    public updateTitle(title: string): void {
        if (!title || title.trim() === '') {
            throw new EmptyTitleAcaraError();
        }
        this.props.title = title;
    }

    public updateDescription(description?: string | null): void {
        this.props.description = description;
    }

    public updateTimeRange(startTime: Date, endTime: Date): void {
        if (startTime.getTime() >= endTime.getTime()) {
            throw new InvalidTimeRangeAcaraError();
        }
        this.props.startTime = startTime;
        this.props.endTime = endTime;
    }

    public addOrUpdateJadwal(jadwalProps: {
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
        const existingIndex = jadwalProps.id
            ? this.props.jadwals.findIndex((j) => j.id === jadwalProps.id)
            : -1;

        const newJadwal = Jadwal.create(jadwalProps);

        if (existingIndex > -1) {
            this.props.jadwals[existingIndex] = newJadwal;
        } else {
            this.props.jadwals.push(newJadwal);
        }

        return newJadwal;
    }

    public removeJadwal(jadwalId: string): void {
        this.props.jadwals = this.props.jadwals.filter((j) => j.id !== jadwalId);
    }

    public validate(): void {
        if (!this.props.title || this.props.title.trim() === '') {
            throw new EmptyTitleAcaraError();
        }
        if (this.props.startTime.getTime() >= this.props.endTime.getTime()) {
            throw new InvalidTimeRangeAcaraError();
        }
    }
}
