import { BadRequestException } from '@nestjs/common';

export class SoalDomainError extends BadRequestException {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

// Soal Aggregate Errors
export class MissingIdSoalError extends SoalDomainError {
    constructor() {
        super('Id is required');
    }
}

export class MissingMateriSoalIdError extends SoalDomainError {
    constructor() {
        super('Materi Soal Id is required');
    }
}

export class EmptyPromptSoalError extends SoalDomainError {
    constructor() {
        super('Prompt cannot be empty');
    }
}

export class NegativeOrderSoalError extends SoalDomainError {
    constructor() {
        super('Order cannot be negative');
    }
}

// Opsi Entity Errors
export class EmptyValueOpsiError extends SoalDomainError {
    constructor() {
        super('Opsi value cannot be empty');
    }
}

export class NegativeOrderOpsiError extends SoalDomainError {
    constructor() {
        super('Opsi order cannot be negative');
    }
}

// Soal Type Errors
export class InvalidSoalTypeError extends SoalDomainError {
    constructor(value: string) {
        super(`Invalid SoalType: ${value}`);
    }
}

export class MissingOpsiError extends SoalDomainError {
    constructor(type: string) {
        super(`${type} must have at least one option`);
    }
}

export class SingleCorrectOpsiRequiredError extends SoalDomainError {
    constructor() {
        super('PILIHAN_GANDA must have exactly one correct option');
    }
}

export class AtLeastOneCorrectOpsiRequiredError extends SoalDomainError {
    constructor() {
        super('PILIHAN_GANDA_KOMPLEKS must have at least one correct option');
    }
}

export class EssaiMustNotHaveOpsiError extends SoalDomainError {
    constructor() {
        super('ESSAI must not have options (opsi)');
    }
}
