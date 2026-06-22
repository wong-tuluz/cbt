import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreatePaketSoalSchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
});

export const UpdatePaketSoalSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
});

export class CreatePaketSoalDto extends createZodDto(CreatePaketSoalSchema) { }

export class UpdatePaketSoalDto extends createZodDto(UpdatePaketSoalSchema) { }
