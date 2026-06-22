import { AggregateRoot } from '@nestjs/cqrs';
import { generateUuidV7 } from '../../../utils/uuid';
import { SoalType } from './soal-type.object';
import { Opsi, OpsiProps } from './opsi.entity';

export interface SoalProps {
    id: string;
    remoteId?: string | null;
    materiSoalId: string;
    type: SoalType;
    prompt: string;
    order: number;
    weightCorrect: number;
    weightWrong: number;
    opsi: Opsi[];
}

export class Soal extends AggregateRoot {
    private constructor(private readonly props: SoalProps) {
        super();
        this.validate();
    }

    public static create(props: {
        id?: string;
        remoteId?: string | null;
        materiSoalId: string;
        type: SoalType;
        prompt: string;
        order: number;
        weightCorrect: number;
        weightWrong: number;
        opsi: Opsi[];
    }): Soal {
        return new Soal({
            ...props,
            id: props.id ?? generateUuidV7('soal'),
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get remoteId(): string | undefined | null {
        return this.props.remoteId;
    }

    public get materiSoalId(): string {
        return this.props.materiSoalId;
    }

    public get type(): SoalType {
        return this.props.type;
    }

    public get prompt(): string {
        return this.props.prompt;
    }

    public get order(): number {
        return this.props.order;
    }

    public get weightCorrect(): number {
        return this.props.weightCorrect;
    }

    public get weightWrong(): number {
        return this.props.weightWrong;
    }

    public get opsi(): Opsi[] {
        return [...this.props.opsi];
    }

    public updatePrompt(prompt: string): void {
        if (!prompt || prompt.trim() === '') {
            throw new Error('Prompt cannot be empty');
        }
        this.props.prompt = prompt;
    }

    public updateOrder(order: number): void {
        if (order < 0) {
            throw new Error('Order cannot be negative');
        }
        this.props.order = order;
    }

    public updateWeights(weightCorrect: number, weightWrong: number): void {
        this.props.weightCorrect = weightCorrect;
        this.props.weightWrong = weightWrong;
    }

    public updateOpsi(newOpsiProps: OpsiProps[]): void {
        const newOpsi = newOpsiProps.map((p) => Opsi.create(p));
        this.props.type.validateOpsi(newOpsi);
        this.props.opsi = newOpsi;
    }

    public changeType(newType: SoalType): void {
        newType.validateOpsi(this.props.opsi);
        this.props.type = newType;
    }

    public validate(): void {
        if (!this.props.id) {
            throw new Error('Id is required');
        }
        if (!this.props.materiSoalId) {
            throw new Error('Materi Soal Id is required');
        }
        if (!this.props.prompt || this.props.prompt.trim() === '') {
            throw new Error('Prompt cannot be empty');
        }
        if (this.props.order < 0) {
            throw new Error('Order cannot be negative');
        }
        this.props.type.validateOpsi(this.props.opsi);
    }
}