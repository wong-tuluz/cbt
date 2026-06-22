import { EmptyValueOpsiError, NegativeOrderOpsiError } from '../errors/soal.errors';

export interface OpsiProps {
    id: string;
    value: string;
    isCorrect: boolean;
    order: number;
}

export class Opsi {
    private constructor(private readonly props: OpsiProps) {}

    public static create(props: OpsiProps): Opsi {
        if (!props.value || props.value.trim() === '') {
            throw new EmptyValueOpsiError();
        }
        if (props.order < 0) {
            throw new NegativeOrderOpsiError();
        }
        return new Opsi(props);
    }

    public get id(): string {
        return this.props.id;
    }

    public get value(): string {
        return this.props.value;
    }

    public get isCorrect(): boolean {
        return this.props.isCorrect;
    }

    public get order(): number {
        return this.props.order;
    }

    public updateValue(value: string): void {
        if (!value || value.trim() === '') {
            throw new EmptyValueOpsiError();
        }
        this.props.value = value;
    }

    public updateIsCorrect(isCorrect: boolean): void {
        this.props.isCorrect = isCorrect;
    }

    public updateOrder(order: number): void {
        if (order < 0) {
            throw new NegativeOrderOpsiError();
        }
        this.props.order = order;
    }

    public toSnapshot(): OpsiProps {
        return { ...this.props };
    }
}