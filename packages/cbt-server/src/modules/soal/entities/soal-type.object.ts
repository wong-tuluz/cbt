export enum SoalTypeValue {
    PILIHAN_GANDA = 'PILIHAN_GANDA',
    PILIHAN_GANDA_KOMPLEKS = 'PILIHAN_GANDA_KOMPLEKS',
    ESSAI = 'ESSAI',
}

export class SoalType {
    private constructor(private readonly value: SoalTypeValue) {}

    public static fromString(value: string): SoalType {
        const normalized = value.trim().toUpperCase().replace(/-/g, '_');
        if (normalized === 'PILIHAN_GANDA' || normalized === 'SINGLE_CHOICE') {
            return new SoalType(SoalTypeValue.PILIHAN_GANDA);
        }
        if (normalized === 'PILIHAN_GANDA_KOMPLEKS' || normalized === 'MULTIPLE_CHOICE') {
            return new SoalType(SoalTypeValue.PILIHAN_GANDA_KOMPLEKS);
        }
        if (normalized === 'ESSAI' || normalized === 'ESSAY') {
            return new SoalType(SoalTypeValue.ESSAI);
        }
        throw new Error(`Invalid SoalType: ${value}`);
    }

    public static pilihanGanda(): SoalType {
        return new SoalType(SoalTypeValue.PILIHAN_GANDA);
    }

    public static pilihanGandaKompleks(): SoalType {
        return new SoalType(SoalTypeValue.PILIHAN_GANDA_KOMPLEKS);
    }

    public static essai(): SoalType {
        return new SoalType(SoalTypeValue.ESSAI);
    }

    public getValue(): SoalTypeValue {
        return this.value;
    }

    public toDbValue(): 'single-choice' | 'multiple-choice' | 'essay' {
        switch (this.value) {
            case SoalTypeValue.PILIHAN_GANDA:
                return 'single-choice';
            case SoalTypeValue.PILIHAN_GANDA_KOMPLEKS:
                return 'multiple-choice';
            case SoalTypeValue.ESSAI:
                return 'essay';
        }
    }

    public equals(other: SoalType): boolean {
        return this.value === other.getValue();
    }

    public isPilihanGanda(): boolean {
        return this.value === SoalTypeValue.PILIHAN_GANDA;
    }

    public isPilihanGandaKompleks(): boolean {
        return this.value === SoalTypeValue.PILIHAN_GANDA_KOMPLEKS;
    }

    public isEssai(): boolean {
        return this.value === SoalTypeValue.ESSAI;
    }

    public validateOpsi(opsi: { isCorrect: boolean }[]): void {
        switch (this.value) {
            case SoalTypeValue.PILIHAN_GANDA:
                if (!opsi || opsi.length === 0) {
                    throw new Error('PILIHAN_GANDA must have at least one option');
                }
                const correctCountPG = opsi.filter((o) => o.isCorrect).length;
                if (correctCountPG !== 1) {
                    throw new Error('PILIHAN_GANDA must have exactly one correct option');
                }
                break;
            case SoalTypeValue.PILIHAN_GANDA_KOMPLEKS:
                if (!opsi || opsi.length === 0) {
                    throw new Error('PILIHAN_GANDA_KOMPLEKS must have at least one option');
                }
                const correctCountPGK = opsi.filter((o) => o.isCorrect).length;
                if (correctCountPGK < 1) {
                    throw new Error('PILIHAN_GANDA_KOMPLEKS must have at least one correct option');
                }
                break;
            case SoalTypeValue.ESSAI:
                if (opsi && opsi.length > 0) {
                    throw new Error('ESSAI must not have options (opsi)');
                }
                break;
        }
    }
}