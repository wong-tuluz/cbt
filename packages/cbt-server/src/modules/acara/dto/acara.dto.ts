import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const saveJadwalSchema = z.object({
    id: z.string().optional(),
    paketSoalId: z.string(),
    title: z.string().min(1),
    startTime: z.string().datetime({ offset: true }).transform((val) => new Date(val)),
    endTime: z.string().datetime({ offset: true }).transform((val) => new Date(val)),
    timeLimit: z.number().int().nonnegative(),
    attempts: z.number().int().positive(),
    token: z.string(),
    remoteId: z.string().nullish(),
});

export class SaveJadwalDto extends createZodDto(saveJadwalSchema) {}

export const saveAcaraSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().nullish(),
    startTime: z.string().datetime({ offset: true }).transform((val) => new Date(val)),
    endTime: z.string().datetime({ offset: true }).transform((val) => new Date(val)),
    remoteId: z.string().nullish(),
    jadwals: z.array(saveJadwalSchema).optional(),
});

export class SaveAcaraDto extends createZodDto(saveAcaraSchema) {}
