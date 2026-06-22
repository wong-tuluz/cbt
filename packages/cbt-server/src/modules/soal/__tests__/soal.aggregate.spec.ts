import { Soal } from '../entities/soal.aggregate';
import { SoalType } from '../entities/soal-type.object';
import { Opsi } from '../entities/opsi.entity';

describe('Soal Aggregate Root', () => {
    it('should successfully create a PILIHAN_GANDA soal with exactly one correct option', () => {
        const type = SoalType.pilihanGanda();
        const opsi = [
            Opsi.create({ id: '1', value: 'Option A', isCorrect: true, order: 1 }),
            Opsi.create({ id: '2', value: 'Option B', isCorrect: false, order: 2 }),
        ];

        const soal = Soal.create({
            id: 'soal-1',
            materiSoalId: 'materi-1',
            type,
            prompt: 'What is 1+1?',
            order: 1,
            weightCorrect: 10,
            weightWrong: 0,
            opsi,
        });

        expect(soal).toBeDefined();
        expect(soal.type.isPilihanGanda()).toBe(true);
        expect(soal.opsi.length).toBe(2);
    });

    it('should throw an error for PILIHAN_GANDA with multiple correct options', () => {
        const type = SoalType.pilihanGanda();
        const opsi = [
            Opsi.create({ id: '1', value: 'Option A', isCorrect: true, order: 1 }),
            Opsi.create({ id: '2', value: 'Option B', isCorrect: true, order: 2 }),
        ];

        expect(() => {
            Soal.create({
                id: 'soal-1',
                materiSoalId: 'materi-1',
                type,
                prompt: 'What is 1+1?',
                order: 1,
                weightCorrect: 10,
                weightWrong: 0,
                opsi,
            });
        }).toThrow('PILIHAN_GANDA must have exactly one correct option');
    });

    it('should throw an error for PILIHAN_GANDA with no correct options', () => {
        const type = SoalType.pilihanGanda();
        const opsi = [
            Opsi.create({ id: '1', value: 'Option A', isCorrect: false, order: 1 }),
            Opsi.create({ id: '2', value: 'Option B', isCorrect: false, order: 2 }),
        ];

        expect(() => {
            Soal.create({
                id: 'soal-1',
                materiSoalId: 'materi-1',
                type,
                prompt: 'What is 1+1?',
                order: 1,
                weightCorrect: 10,
                weightWrong: 0,
                opsi,
            });
        }).toThrow('PILIHAN_GANDA must have exactly one correct option');
    });

    it('should successfully create a PILIHAN_GANDA_KOMPLEKS soal with at least one correct option', () => {
        const type = SoalType.pilihanGandaKompleks();
        const opsi = [
            Opsi.create({ id: '1', value: 'Option A', isCorrect: true, order: 1 }),
            Opsi.create({ id: '2', value: 'Option B', isCorrect: true, order: 2 }),
        ];

        const soal = Soal.create({
            id: 'soal-1',
            materiSoalId: 'materi-1',
            type,
            prompt: 'Select numbers greater than 5',
            order: 1,
            weightCorrect: 10,
            weightWrong: 0,
            opsi,
        });

        expect(soal).toBeDefined();
        expect(soal.type.isPilihanGandaKompleks()).toBe(true);
    });

    it('should throw an error for PILIHAN_GANDA_KOMPLEKS with no correct options', () => {
        const type = SoalType.pilihanGandaKompleks();
        const opsi = [
            Opsi.create({ id: '1', value: 'Option A', isCorrect: false, order: 1 }),
            Opsi.create({ id: '2', value: 'Option B', isCorrect: false, order: 2 }),
        ];

        expect(() => {
            Soal.create({
                id: 'soal-1',
                materiSoalId: 'materi-1',
                type,
                prompt: 'Select numbers greater than 5',
                order: 1,
                weightCorrect: 10,
                weightWrong: 0,
                opsi,
            });
        }).toThrow('PILIHAN_GANDA_KOMPLEKS must have at least one correct option');
    });

    it('should successfully create an ESSAI soal with no options', () => {
        const type = SoalType.essai();

        const soal = Soal.create({
            id: 'soal-1',
            materiSoalId: 'materi-1',
            type,
            prompt: 'Explain the water cycle.',
            order: 1,
            weightCorrect: 10,
            weightWrong: 0,
            opsi: [],
        });

        expect(soal).toBeDefined();
        expect(soal.type.isEssai()).toBe(true);
        expect(soal.opsi.length).toBe(0);
    });

    it('should throw an error for ESSAI soal if options are provided', () => {
        const type = SoalType.essai();
        const opsi = [
            Opsi.create({ id: '1', value: 'Option A', isCorrect: false, order: 1 }),
        ];

        expect(() => {
            Soal.create({
                id: 'soal-1',
                materiSoalId: 'materi-1',
                type,
                prompt: 'Explain the water cycle.',
                order: 1,
                weightCorrect: 10,
                weightWrong: 0,
                opsi,
            });
        }).toThrow('ESSAI must not have options (opsi)');
    });
});
