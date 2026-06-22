export class SavePaketSoalCommand {
    constructor(
        public readonly id: string | undefined,
        public readonly title: string,
        public readonly description: string | null | undefined,
        public readonly remoteId: string | null | undefined,
    ) {}
}
