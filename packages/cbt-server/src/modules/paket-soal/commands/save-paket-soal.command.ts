export class SavePaketSoalCommand {
    constructor(
        public readonly id: string | undefined,
        public readonly title: string,
        public readonly description: string | null | undefined,
        public readonly remoteId: string | null | undefined,
        public readonly materi?: Array<{
            id?: string;
            title: string;
            description?: string | null;
            order: number;
            timeLimit: number;
            remoteId?: string | null;
        }>,
    ) {}
}
