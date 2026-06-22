import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { SaveAcaraHandler } from '../commands/save-acara.handler';
import { SaveAcaraCommand } from '../commands/save-acara.command';
import { AcaraRepository } from '../repository/acara.repository';
import { AcaraSavedEvent } from '../events/acara-saved.event';
import { EmptyTitleAcaraError } from '../errors/acara.errors';
import { Acara } from '../entities/acara.aggregate';

describe('SaveAcaraHandler', () => {
    let handler: SaveAcaraHandler;
    let repository: jest.Mocked<AcaraRepository>;
    let publisher: jest.Mocked<EventPublisher>;
    const defaultStart = new Date(Date.now() + 10000);
    const defaultEnd = new Date(Date.now() + 20000);

    beforeEach(async () => {
        const mockRepository = {
            findById: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockImplementation((acara) => Promise.resolve(acara)),
        };

        const mockPublisher = {
            mergeObjectContext: jest.fn().mockImplementation((obj) => ({
                apply: jest.fn(),
                commit: jest.fn(),
            })),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SaveAcaraHandler,
                { provide: AcaraRepository, useValue: mockRepository },
                { provide: EventPublisher, useValue: mockPublisher },
            ],
        }).compile();

        handler = module.get<SaveAcaraHandler>(SaveAcaraHandler);
        repository = module.get(AcaraRepository);
        publisher = module.get(EventPublisher);
    });

    it('should successfully save a valid Acara and emit event', async () => {
        const command = new SaveAcaraCommand(
            'acara-123',
            'Tryout Akbar',
            defaultStart,
            defaultEnd,
            'Description info',
            'remote-789',
            [
                {
                    id: 'j-1',
                    paketSoalId: 'p-1',
                    title: 'Sesi 1',
                    startTime: defaultStart,
                    endTime: defaultEnd,
                    timeLimit: 60,
                    attempts: 1,
                    token: 't-123',
                }
            ]
        );

        const mockApply = jest.fn();
        const mockCommit = jest.fn();
        publisher.mergeObjectContext.mockReturnValue({
            apply: mockApply,
            commit: mockCommit,
        } as any);

        const result = await handler.execute(command);

        expect(result).toEqual({ id: 'acara-123' });
        expect(repository.save).toHaveBeenCalled();
        expect(publisher.mergeObjectContext).toHaveBeenCalled();
        expect(mockApply).toHaveBeenCalledWith(new AcaraSavedEvent('acara-123'));
        expect(mockCommit).toHaveBeenCalled();
    });

    it('should update existing aggregate if found in repository', async () => {
        const existingAggregate = Acara.create({
            id: 'acara-123',
            title: 'Existing Title',
            startTime: defaultStart,
            endTime: defaultEnd,
        });
        repository.findById.mockResolvedValue(existingAggregate);

        const command = new SaveAcaraCommand(
            'acara-123',
            'Updated Title',
            defaultStart,
            defaultEnd,
            'New Description',
            'remote-789',
            []
        );

        await handler.execute(command);

        expect(repository.findById).toHaveBeenCalledWith('acara-123');
        expect(existingAggregate.title).toBe('Updated Title');
        expect(existingAggregate.description).toBe('New Description');
    });

    it('should throw EmptyTitleAcaraError if title is empty', async () => {
        const command = new SaveAcaraCommand(
            'acara-123',
            '',
            defaultStart,
            defaultEnd,
            'Description',
            'remote-789',
        );

        await expect(handler.execute(command)).rejects.toThrow(EmptyTitleAcaraError);
        expect(repository.save).not.toHaveBeenCalled();
    });
});
