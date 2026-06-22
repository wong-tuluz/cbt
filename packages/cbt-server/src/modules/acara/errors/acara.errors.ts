import { BadRequestException } from '@nestjs/common';

export class AcaraDomainError extends BadRequestException {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class EmptyTitleAcaraError extends AcaraDomainError {
    constructor() {
        super('Acara title cannot be empty');
    }
}

export class InvalidTimeRangeAcaraError extends AcaraDomainError {
    constructor() {
        super('Acara start time must be before end time');
    }
}

export class EmptyTitleJadwalError extends AcaraDomainError {
    constructor() {
        super('Jadwal title cannot be empty');
    }
}

export class NegativeTimeLimitJadwalError extends AcaraDomainError {
    constructor() {
        super('Jadwal time limit cannot be negative');
    }
}

export class NegativeAttemptsJadwalError extends AcaraDomainError {
    constructor() {
        super('Jadwal attempts must be positive');
    }
}
