export class SaveSoalCommand {
    constructor(
        public readonly id: string | undefined,
        public readonly materiSoalId: string,
        public readonly type: string,
        public readonly prompt: string,
        public readonly order: number,
        public readonly weightCorrect: number,
        public readonly weightWrong: number,
        public readonly remoteId: string | null | undefined,
        public readonly jawaban: Array<{
            id?: string;
            value: string;
            isCorrect: boolean;
            order: number;
        }> | undefined,
    ) {}
}
