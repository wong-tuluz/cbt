import { PaketSoal } from '../entities/paket-soal.aggregate';
import { Materi } from '../entities/materi.entity';
import {
    EmptyTitlePaketSoalError,
    EmptyTitleMateriError,
    NegativeOrderMateriError,
    NegativeTimeLimitMateriError,
} from '../errors/paket-soal.errors';

describe('PaketSoal Aggregate Root with Materi', () => {
    it('should successfully create a valid PaketSoal with child materi', () => {
        const materi1 = Materi.create({ id: 'm-1', title: 'Aritmatika', order: 1, timeLimit: 30 });
        const materi2 = Materi.create({ id: 'm-2', title: 'Aljabar', order: 2, timeLimit: 40 });

        const paket = PaketSoal.create({
            id: 'paket-123',
            title: 'Ujian Akhir Semester',
            description: 'Matematika',
            materi: [materi1, materi2],
        });

        expect(paket).toBeDefined();
        expect(paket.materi.length).toBe(2);
        expect(paket.materi[0].title).toBe('Aritmatika');
    });

    it('should throw EmptyTitleMateriError if materi title is empty', () => {
        expect(() => {
            Materi.create({
                title: '',
                order: 1,
                timeLimit: 30,
            });
        }).toThrow(EmptyTitleMateriError);
    });

    it('should throw NegativeOrderMateriError if materi order is negative', () => {
        expect(() => {
            Materi.create({
                title: 'Aljabar',
                order: -1,
                timeLimit: 30,
            });
        }).toThrow(NegativeOrderMateriError);
    });

    it('should throw NegativeTimeLimitMateriError if materi timeLimit is zero or negative', () => {
        expect(() => {
            Materi.create({
                title: 'Aljabar',
                order: 1,
                timeLimit: 0,
            });
        }).toThrow(NegativeTimeLimitMateriError);

        expect(() => {
            Materi.create({
                title: 'Aljabar',
                order: 1,
                timeLimit: -5,
            });
        }).toThrow(NegativeTimeLimitMateriError);
    });

    it('should support adding and removing materi through the aggregate', () => {
        const paket = PaketSoal.create({
            title: 'Ujian Akhir Semester',
        });

        const materi = paket.addOrUpdateMateri({
            id: 'm-100',
            title: 'Trigonometri',
            order: 3,
            timeLimit: 25,
        });

        expect(paket.materi.length).toBe(1);
        expect(paket.materi[0].id).toBe('m-100');

        paket.removeMateri('m-100');
        expect(paket.materi.length).toBe(0);
    });
});
