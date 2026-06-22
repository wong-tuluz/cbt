import { AggregateRoot } from '@nestjs/cqrs';
import { generateUuidV7 } from '../../../utils/uuid';
import { MissingIdPaketSoalError, EmptyTitlePaketSoalError } from '../errors/paket-soal.errors';
import { Materi } from './materi.entity';

export interface PaketSoalProps {
    id: string;
    remoteId?: string | null;
    title: string;
    description?: string | null;
    materi: Materi[];
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
        materi?: Materi[];
    }): PaketSoal {
        return new PaketSoal({
            ...props,
            id: props.id ?? generateUuidV7('paket-soal'),
            materi: props.materi ?? [],
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

    public get materi(): Materi[] {
        return [...this.props.materi];
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

    public addOrUpdateMateri(materiProps: {
        id?: string;
        title: string;
        description?: string | null;
        order: number;
        timeLimit: number;
        remoteId?: string | null;
    }): Materi {
        const existingIndex = materiProps.id
            ? this.props.materi.findIndex((m) => m.id === materiProps.id)
            : -1;

        const newMateri = Materi.create(materiProps);

        if (existingIndex > -1) {
            this.props.materi[existingIndex] = newMateri;
        } else {
            this.props.materi.push(newMateri);
        }

        return newMateri;
    }

    public removeMateri(materiId: string): void {
        this.props.materi = this.props.materi.filter((m) => m.id !== materiId);
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
