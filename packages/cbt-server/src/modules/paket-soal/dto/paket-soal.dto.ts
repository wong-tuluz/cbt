import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const MateriInputSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    order: z.number().int().nonnegative(),
    timeLimit: z.number().int().positive(),
    remoteId: z.string().nullable().optional(),
});

export const CreatePaketSoalSchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    materi: z.array(MateriInputSchema).optional(),
});

export const UpdatePaketSoalSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    materi: z.array(MateriInputSchema).optional(),
});

export class CreatePaketSoalDto extends createZodDto(CreatePaketSoalSchema) { }

export class UpdatePaketSoalDto extends createZodDto(UpdatePaketSoalSchema) { }
