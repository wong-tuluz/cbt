import { PaketSoal } from '../entities/paket-soal.aggregate';
import { EmptyTitlePaketSoalError } from '../errors/paket-soal.errors';

describe('PaketSoal Aggregate Root', () => {
    it('should successfully create a valid PaketSoal', () => {
        const paket = PaketSoal.create({
            id: 'paket-123',
            title: 'Ujian Akhir Semester',
            description: 'Soal UAS Matematika',
        });

        expect(paket).toBeDefined();
        expect(paket.id).toBe('paket-123');
        expect(paket.title).toBe('Ujian Akhir Semester');
        expect(paket.description).toBe('Soal UAS Matematika');
    });

    it('should generate a new UUID v7 if id is not specified', () => {
        const paket = PaketSoal.create({
            title: 'Ujian Akhir Semester',
        });

        expect(paket.id).toBeDefined();
        expect(paket.id.length).toBeGreaterThan(0);
    });

    it('should throw EmptyTitlePaketSoalError if title is empty', () => {
        expect(() => {
            PaketSoal.create({
                title: '',
            });
        }).toThrow(EmptyTitlePaketSoalError);

        expect(() => {
            PaketSoal.create({
                title: '   ',
            });
        }).toThrow(EmptyTitlePaketSoalError);
    });

    it('should throw EmptyTitlePaketSoalError when updating title to empty string', () => {
        const paket = PaketSoal.create({
            title: 'Ujian Awal',
        });

        expect(() => {
            paket.updateTitle('');
        }).toThrow(EmptyTitlePaketSoalError);
    });

    it('should successfully update title and description', () => {
        const paket = PaketSoal.create({
            title: 'Ujian Awal',
            description: 'Deskripsi Awal',
        });

        paket.updateTitle('Ujian Akhir');
        paket.updateDescription('Deskripsi Akhir');

        expect(paket.title).toBe('Ujian Akhir');
        expect(paket.description).toBe('Deskripsi Akhir');
    });
});
