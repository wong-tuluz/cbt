import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { SaveSoalHandler } from '../commands/save-soal.handler';
import { SaveSoalCommand } from '../commands/save-soal.command';
import { SoalRepository } from '../repository/soal.repository';
import { SoalSavedEvent } from '../events/soal-saved.event';
import { BadRequestException } from '@nestjs/common';

describe('SaveSoalHandler', () => {
    let handler: SaveSoalHandler;
    let repository: jest.Mocked<SoalRepository>;
    let publisher: jest.Mocked<EventPublisher>;

    beforeEach(async () => {
        const mockRepository = {
            save: jest.fn().mockImplementation((soal) => Promise.resolve(soal)),
        };

        const mockPublisher = {
            mergeObjectContext: jest.fn().mockImplementation((obj) => ({
                apply: jest.fn(),
                commit: jest.fn(),
            })),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SaveSoalHandler,
                { provide: SoalRepository, useValue: mockRepository },
                { provide: EventPublisher, useValue: mockPublisher },
            ],
        }).compile();

        handler = module.get<SaveSoalHandler>(SaveSoalHandler);
        repository = module.get(SoalRepository);
        publisher = module.get(EventPublisher);
    });

    it('should successfully save a valid PILIHAN_GANDA soal and emit event', async () => {
        const command = new SaveSoalCommand(
            'soal-123',
            'materi-456',
            'PILIHAN_GANDA',
            'What is 2+2?',
            1,
            10,
            0,
            null,
            [
                { id: 'opt-1', value: '4', isCorrect: true, order: 1 },
                { id: 'opt-2', value: '5', isCorrect: false, order: 2 },
            ],
        );

        const mockApply = jest.fn();
        const mockCommit = jest.fn();
        publisher.mergeObjectContext.mockReturnValue({
            apply: mockApply,
            commit: mockCommit,
        } as any);

        const result = await handler.execute(command);

        expect(result).toEqual({ id: 'soal-123' });
        expect(repository.save).toHaveBeenCalled();
        expect(publisher.mergeObjectContext).toHaveBeenCalled();
        expect(mockApply).toHaveBeenCalledWith(new SoalSavedEvent('soal-123'));
        expect(mockCommit).toHaveBeenCalled();
    });

    it('should throw BadRequestException if options are invalid', async () => {
        const command = new SaveSoalCommand(
            'soal-123',
            'materi-456',
            'PILIHAN_GANDA',
            'What is 2+2?',
            1,
            10,
            0,
            null,
            [
                { id: 'opt-1', value: '4', isCorrect: false, order: 1 },
                { id: 'opt-2', value: '5', isCorrect: false, order: 2 },
            ],
        );

        await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
        expect(repository.save).not.toHaveBeenCalled();
    });
});
