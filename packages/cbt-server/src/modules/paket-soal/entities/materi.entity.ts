import { generateUuidV7 } from '../../../utils/uuid';
import {
    EmptyTitleMateriError,
    NegativeOrderMateriError,
    NegativeTimeLimitMateriError,
} from '../errors/paket-soal.errors';

export interface MateriProps {
    id: string;
    title: string;
    description?: string | null;
    order: number;
    timeLimit: number;
    remoteId?: string | null;
}

export class Materi {
    private constructor(private readonly props: MateriProps) {}

    public static create(props: {
        id?: string;
        title: string;
        description?: string | null;
        order: number;
        timeLimit: number;
        remoteId?: string | null;
    }): Materi {
        if (!props.title || props.title.trim() === '') {
            throw new EmptyTitleMateriError();
        }
        if (props.order < 0) {
            throw new NegativeOrderMateriError();
        }
        if (props.timeLimit <= 0) {
            throw new NegativeTimeLimitMateriError();
        }
        return new Materi({
            ...props,
            id: props.id ?? generateUuidV7('paket-soal'),
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get title(): string {
        return this.props.title;
    }

    public get description(): string | undefined | null {
        return this.props.description;
    }

    public get order(): number {
        return this.props.order;
    }

    public get timeLimit(): number {
        return this.props.timeLimit;
    }

    public get remoteId(): string | undefined | null {
        return this.props.remoteId;
    }

    public updateTitle(title: string): void {
        if (!title || title.trim() === '') {
            throw new EmptyTitleMateriError();
        }
        this.props.title = title;
    }

    public updateDescription(description?: string | null): void {
        this.props.description = description;
    }

    public updateOrder(order: number): void {
        if (order < 0) {
            throw new NegativeOrderMateriError();
        }
        this.props.order = order;
    }

    public updateTimeLimit(timeLimit: number): void {
        if (timeLimit <= 0) {
            throw new NegativeTimeLimitMateriError();
        }
        this.props.timeLimit = timeLimit;
    }
}
