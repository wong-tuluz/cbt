export class SaveAcaraCommand {
    constructor(
        public readonly id: string | undefined,
        public readonly title: string,
        public readonly startTime: Date,
        public readonly endTime: Date,
        public readonly description: string | null | undefined,
        public readonly remoteId: string | null | undefined,
        public readonly jadwals?: Array<{
            id?: string;
            paketSoalId: string;
            title: string;
            startTime: Date;
            endTime: Date;
            timeLimit: number;
            attempts: number;
            token: string;
            remoteId?: string | null;
        }>,
    ) {}
}
