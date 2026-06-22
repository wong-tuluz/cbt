export class PengerjaanFinishedEvent {
    constructor(
        public readonly pengerjaanId: string,
        public readonly siswaId: string
    ) {}
}

export class PengerjaanResetEvent {
    constructor(
        public readonly pengerjaanId: string,
        public readonly siswaId: string
    ) {}
}

export class PengerjaanTimeResetEvent {
    constructor(
        public readonly pengerjaanId: string,
        public readonly siswaId: string
    ) {}
}

export class PengerjaanWarnedEvent {
    constructor(
        public readonly pengerjaanId: string,
        public readonly siswaId: string,
        public readonly strike: number
    ) {}
}

export class PengerjaanUnwarnedEvent {
    constructor(
        public readonly pengerjaanId: string,
        public readonly siswaId: string
    ) {}
}

export class PengerjaanActionSubmittedEvent {
    constructor(
        public readonly pengerjaanId: string,
        public readonly siswaId: string,
        public readonly soalId: string
    ) {}
}
