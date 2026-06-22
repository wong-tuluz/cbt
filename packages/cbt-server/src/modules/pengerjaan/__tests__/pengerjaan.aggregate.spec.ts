import { PengerjaanAggregate } from '../entities/pengerjaan.aggregate';
import { SessionExpiredError, SessionStaleError } from '../errors/pengerjaan.errors';

describe('Pengerjaan Aggregate Root', () => {
    it('should create a new session and generate pengerjaan-started event', () => {
        const id = 'session-123';
        const siswaId = 'siswa-456';
        const jadwalId = 'jadwal-789';
        const paketSoalId = 'paket-abc';
        const timeLimit = 60;

        const aggregate = PengerjaanAggregate.createNew(id, siswaId, jadwalId, paketSoalId, timeLimit);

        expect(aggregate.id).toBe(id);
        expect(aggregate.siswaId).toBe(siswaId);
        expect(aggregate.jadwalId).toBe(jadwalId);
        expect(aggregate.status).toBe('in_progress');
        expect(aggregate.strike).toBe(0);
        expect(aggregate.timeLimit).toBe(timeLimit);
        expect(aggregate.finishedAt).toBeNull();

        const events = aggregate.getUncommittedEvents();
        expect(events.length).toBe(1);
        expect(events[0].type).toBe('pengerjaan-started');
        expect(events[0].payload.id).toBe(id);
        expect(events[0].payload.siswaId).toBe(siswaId);
    });

    it('should correctly replay event history to rebuild state', () => {
        const startedTime = new Date('2026-06-22T10:00:00Z');
        const answeredTime = new Date('2026-06-22T10:05:00Z');

        const events = [
            {
                type: 'pengerjaan-started',
                payload: {
                    id: 'session-123',
                    siswaId: 'siswa-456',
                    jadwalId: 'jadwal-789',
                    paketSoalId: 'paket-abc',
                    timeLimit: 60,
                    startedAt: startedTime
                },
                createdAt: startedTime
            },
            {
                type: 'question-answered',
                payload: {
                    soalId: 'soal-1',
                    jawaban: [{ jawabanSoalId: 'choice-1', value: 'Option A' }]
                },
                createdAt: answeredTime
            },
            {
                type: 'question-marked',
                payload: {
                    soalId: 'soal-1',
                    isMarked: true
                },
                createdAt: answeredTime
            },
            {
                type: 'pengerjaan-warned',
                payload: { strike: 1 },
                createdAt: answeredTime
            }
        ];

        const aggregate = PengerjaanAggregate.loadFromHistory(events);

        expect(aggregate.id).toBe('session-123');
        expect(aggregate.status).toBe('in_progress');
        expect(aggregate.strike).toBe(1);
        expect(aggregate.answers.get('soal-1')).toEqual([{ jawabanSoalId: 'choice-1', value: 'Option A' }]);
        expect(aggregate.markers.get('soal-1')).toBe(true);
        expect(aggregate.getUncommittedEvents().length).toBe(0);
    });

    it('should issue warnings and reset strike via unwarn', () => {
        const aggregate = PengerjaanAggregate.createNew('s-1', 'siswa-1', 'jad-1', 'pkt-1', 45);

        aggregate.warn();
        expect(aggregate.strike).toBe(1);
        expect(aggregate.getUncommittedEvents()[1].type).toBe('pengerjaan-warned');

        aggregate.warn();
        expect(aggregate.strike).toBe(2);

        aggregate.unwarn();
        expect(aggregate.strike).toBe(0);
        expect(aggregate.getUncommittedEvents()[3].type).toBe('pengerjaan-unwarned');
    });

    it('should allow answering and marking questions when active', () => {
        const aggregate = PengerjaanAggregate.createNew('s-1', 'siswa-1', 'jad-1', 'pkt-1', 45);

        aggregate.answerQuestion('soal-1', [{ jawabanSoalId: 'ans-1', value: 'Value 1' }]);
        expect(aggregate.answers.get('soal-1')).toEqual([{ jawabanSoalId: 'ans-1', value: 'Value 1' }]);

        aggregate.markQuestion('soal-1', true);
        expect(aggregate.markers.get('soal-1')).toBe(true);
    });

    it('should throw SessionStaleError when trying to answer questions in finished session', () => {
        const aggregate = PengerjaanAggregate.createNew('s-1', 'siswa-1', 'jad-1', 'pkt-1', 45);
        aggregate.finish();

        expect(() => {
            aggregate.answerQuestion('soal-1', []);
        }).toThrow(SessionStaleError);

        expect(() => {
            aggregate.markQuestion('soal-1', true);
        }).toThrow(SessionStaleError);
    });

    it('should throw SessionExpiredError when session time limit is exceeded', () => {
        const startedTime = new Date(Date.now() - 65 * 60 * 1000); // 65 minutes ago

        const events = [
            {
                type: 'pengerjaan-started',
                payload: {
                    id: 'session-123',
                    siswaId: 'siswa-456',
                    jadwalId: 'jadwal-789',
                    paketSoalId: 'paket-abc',
                    timeLimit: 60, // 60 minutes limit
                    startedAt: startedTime
                },
                createdAt: startedTime
            }
        ];

        const aggregate = PengerjaanAggregate.loadFromHistory(events);
        expect(aggregate.isExpired()).toBe(true);

        expect(() => {
            aggregate.answerQuestion('soal-1', []);
        }).toThrow(SessionExpiredError);
    });
});
