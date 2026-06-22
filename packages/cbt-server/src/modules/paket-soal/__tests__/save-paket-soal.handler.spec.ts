import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { SavePaketSoalHandler } from '../commands/save-paket-soal.handler';
import { SavePaketSoalCommand } from '../commands/save-paket-soal.command';
import { PaketSoalRepository } from '../repository/paket-soal.repository';
import { PaketSoalSavedEvent } from '../events/paket-soal-saved.event';
import { EmptyTitlePaketSoalError } from '../errors/paket-soal.errors';

describe('SavePaketSoalHandler', () => {
    let handler: SavePaketSoalHandler;
    let repository: jest.Mocked<PaketSoalRepository>;
    let publisher: jest.Mocked<EventPublisher>;

    beforeEach(async () => {
        const mockRepository = {
            save: jest.fn().mockImplementation((paket) => Promise.resolve(paket)),
        };

        const mockPublisher = {
            mergeObjectContext: jest.fn().mockImplementation((obj) => ({
                apply: jest.fn(),
                commit: jest.fn(),
            })),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SavePaketSoalHandler,
                { provide: PaketSoalRepository, useValue: mockRepository },
                { provide: EventPublisher, useValue: mockPublisher },
            ],
        }).compile();

        handler = module.get<SavePaketSoalHandler>(SavePaketSoalHandler);
        repository = module.get(PaketSoalRepository);
        publisher = module.get(EventPublisher);
    });

    it('should successfully save a valid PaketSoal and emit event', async () => {
        const command = new SavePaketSoalCommand(
            'paket-123',
            'Ujian Akhir Semester',
            'Soal UAS Matematika',
            'remote-789',
        );

        const mockApply = jest.fn();
        const mockCommit = jest.fn();
        publisher.mergeObjectContext.mockReturnValue({
            apply: mockApply,
            commit: mockCommit,
        } as any);

        const result = await handler.execute(command);

        expect(result).toEqual({ id: 'paket-123' });
        expect(repository.save).toHaveBeenCalled();
        expect(publisher.mergeObjectContext).toHaveBeenCalled();
        expect(mockApply).toHaveBeenCalledWith(new PaketSoalSavedEvent('paket-123'));
        expect(mockCommit).toHaveBeenCalled();
    });

    it('should throw EmptyTitlePaketSoalError if title is empty', async () => {
        const command = new SavePaketSoalCommand(
            'paket-123',
            '',
            'Soal UAS Matematika',
            'remote-789',
        );

        await expect(handler.execute(command)).rejects.toThrow(EmptyTitlePaketSoalError);
        expect(repository.save).not.toHaveBeenCalled();
    });
});
