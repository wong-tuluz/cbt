import { Acara } from '../entities/acara.aggregate';
import { Jadwal } from '../entities/jadwal.entity';
import {
    EmptyTitleAcaraError,
    InvalidTimeRangeAcaraError,
    EmptyTitleJadwalError,
    NegativeTimeLimitJadwalError,
    NegativeAttemptsJadwalError,
} from '../errors/acara.errors';

describe('Acara Aggregate Root with Jadwal', () => {
    const defaultStart = new Date(Date.now() + 10000);
    const defaultEnd = new Date(Date.now() + 20000);

    it('should successfully create a valid Acara with child jadwal', () => {
        const jadwal1 = Jadwal.create({
            id: 'j-1',
            paketSoalId: 'p-1',
            title: 'Sesi Pagi',
            startTime: defaultStart,
            endTime: defaultEnd,
            timeLimit: 60,
            attempts: 1,
            token: 't-123',
        });

        const acara = Acara.create({
            id: 'acara-1',
            title: 'Tryout Akbar',
            description: 'Ujian Persiapan',
            startTime: defaultStart,
            endTime: defaultEnd,
            jadwals: [jadwal1],
        });

        expect(acara).toBeDefined();
        expect(acara.jadwals.length).toBe(1);
        expect(acara.jadwals[0].title).toBe('Sesi Pagi');
    });

    it('should throw EmptyTitleAcaraError if acara title is empty', () => {
        expect(() => {
            Acara.create({
                title: '',
                startTime: defaultStart,
                endTime: defaultEnd,
            });
        }).toThrow(EmptyTitleAcaraError);
    });

    it('should throw InvalidTimeRangeAcaraError if start time is after or equal to end time', () => {
        expect(() => {
            Acara.create({
                title: 'Invalid Time Acara',
                startTime: defaultEnd,
                endTime: defaultStart,
            });
        }).toThrow(InvalidTimeRangeAcaraError);
    });

    it('should throw EmptyTitleJadwalError if jadwal title is empty', () => {
        expect(() => {
            Jadwal.create({
                paketSoalId: 'p-1',
                title: '',
                startTime: defaultStart,
                endTime: defaultEnd,
                timeLimit: 60,
                attempts: 1,
                token: 't-123',
            });
        }).toThrow(EmptyTitleJadwalError);
    });

    it('should throw NegativeTimeLimitJadwalError if timeLimit is negative', () => {
        expect(() => {
            Jadwal.create({
                paketSoalId: 'p-1',
                title: 'Jadwal minus time',
                startTime: defaultStart,
                endTime: defaultEnd,
                timeLimit: -1,
                attempts: 1,
                token: 't-123',
            });
        }).toThrow(NegativeTimeLimitJadwalError);
    });

    it('should throw NegativeAttemptsJadwalError if attempts is less than or equal to 0', () => {
        expect(() => {
            Jadwal.create({
                paketSoalId: 'p-1',
                title: 'Jadwal zero attempts',
                startTime: defaultStart,
                endTime: defaultEnd,
                timeLimit: 60,
                attempts: 0,
                token: 't-123',
            });
        }).toThrow(NegativeAttemptsJadwalError);
    });

    it('should support adding and removing jadwal through the aggregate', () => {
        const acara = Acara.create({
            title: 'Tryout Akbar',
            startTime: defaultStart,
            endTime: defaultEnd,
        });

        const j = acara.addOrUpdateJadwal({
            id: 'j-100',
            paketSoalId: 'p-1',
            title: 'Sesi Siang',
            startTime: defaultStart,
            endTime: defaultEnd,
            timeLimit: 90,
            attempts: 2,
            token: 'token-456',
        });

        expect(acara.jadwals.length).toBe(1);
        expect(acara.jadwals[0].id).toBe('j-100');

        acara.removeJadwal('j-100');
        expect(acara.jadwals.length).toBe(0);
    });
});
