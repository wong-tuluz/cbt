export class CreatePengerjaanCommand {
    constructor(
        public readonly siswaId: string,
        public readonly jadwalId: string,
        public readonly token: string
    ) {}
}

export class SubmitPengerjaanActionCommand {
    constructor(
        public readonly pengerjaanId: string,
        public readonly soalId: string,
        public readonly marked?: boolean,
        public readonly jawaban: Array<{
            jawabanSoalId: string | null,
            value: string | null
        }> = []
    ) {}
}

export class FinishPengerjaanCommand {
    constructor(public readonly pengerjaanId: string) {}
}

export class ResetPengerjaanCommand {
    constructor(public readonly pengerjaanId: string) {}
}

export class ResetPengerjaanTimeCommand {
    constructor(public readonly pengerjaanId: string) {}
}

export class WarnPengerjaanCommand {
    constructor(public readonly pengerjaanId: string) {}
}

export class UnwarnPengerjaanCommand {
    constructor(public readonly pengerjaanId: string) {}
}
