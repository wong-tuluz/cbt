import { BadRequestException } from '@nestjs/common';

export class PaketSoalDomainError extends BadRequestException {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class MissingIdPaketSoalError extends PaketSoalDomainError {
    constructor() {
        super('Id is required');
    }
}

export class EmptyTitlePaketSoalError extends PaketSoalDomainError {
    constructor() {
        super('Title cannot be empty');
    }
}

// Materi Entity Errors
export class EmptyTitleMateriError extends PaketSoalDomainError {
    constructor() {
        super('Materi title cannot be empty');
    }
}

export class NegativeOrderMateriError extends PaketSoalDomainError {
    constructor() {
        super('Materi order cannot be negative');
    }
}

export class NegativeTimeLimitMateriError extends PaketSoalDomainError {
    constructor() {
        super('Materi time limit must be positive');
    }
}
