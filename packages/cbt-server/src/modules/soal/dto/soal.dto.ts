import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const SoalTypeSchema = z.enum([
    'single-choice',
    'multiple-choice',
    'essay',
]);

export const JawabanInputSchema = z.object({
    value: z.string().min(1),
    isCorrect: z.boolean(),
    order: z.number().int().nonnegative(),
});

export const CreateSoalSchema = z
    .object({
        materiSoalId: z.string().uuid(),
        type: SoalTypeSchema,
        prompt: z.string().min(1),
        order: z.number().int().nonnegative(),
        weightCorrect: z.number(),
        weightWrong: z.number(),
        jawaban: z.array(JawabanInputSchema).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === 'essay' && data.jawaban?.length) {
            ctx.addIssue({
                code: 'custom',
                message: 'Essay soal must not have jawaban',
                path: ['jawaban'],
            });
        }
    });

export const UpdateSoalSchema = z.object({
    prompt: z.string().min(1).optional(),
    order: z.number().int().nonnegative().optional(),
    weightCorrect: z.number().optional(),
    weightWrong: z.number().optional(),
    jawaban: z.array(JawabanInputSchema).optional(),
});

export class CreateSoalDto extends createZodDto(CreateSoalSchema) { }

export class UpdateSoalDto extends createZodDto(UpdateSoalSchema) { }
