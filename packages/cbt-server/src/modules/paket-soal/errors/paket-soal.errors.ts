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
