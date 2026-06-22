import { AggregateRoot } from '@nestjs/cqrs';
import { generateUuidV7 } from '../../../utils/uuid';
import { MissingIdPaketSoalError, EmptyTitlePaketSoalError } from '../errors/paket-soal.errors';

export interface PaketSoalProps {
    id: string;
    remoteId?: string | null;
    title: string;
    description?: string | null;
}

export class PaketSoal extends AggregateRoot {
    private constructor(private readonly props: PaketSoalProps) {
        super();
        this.validate();
    }

    public static create(props: {
        id?: string;
        remoteId?: string | null;
        title: string;
        description?: string | null;
    }): PaketSoal {
        return new PaketSoal({
            ...props,
            id: props.id ?? generateUuidV7('paket-soal'),
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

    public updateTitle(title: string): void {
        if (!title || title.trim() === '') {
            throw new EmptyTitlePaketSoalError();
        }
        this.props.title = title;
    }

    public updateDescription(description?: string | null): void {
        this.props.description = description;
    }

    public validate(): void {
        if (!this.props.id) {
            throw new MissingIdPaketSoalError();
        }
        if (!this.props.title || this.props.title.trim() === '') {
            throw new EmptyTitlePaketSoalError();
        }
    }
}
