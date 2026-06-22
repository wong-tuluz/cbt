import { mysqlTable, varchar, datetime, boolean, mysqlEnum, index, text } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { int } from 'drizzle-orm/mysql-core';

export const pengerjaanTable = mysqlTable('pengerjaan', {
    id: varchar('id', { length: 255 }).primaryKey(),
    siswaId: varchar('siswa_id', { length: 255 }).notNull(),
    jadwalId: varchar('jadwal_id', { length: 255 }).notNull(),

    paketSoalId: varchar('paket_soal_id', { length: 255 }).notNull(),
    materiSoalId: varchar('materi_soal_id', { length: 255 }),
    status: mysqlEnum('status', [
        'in_progress',
        'finished',
    ]).notNull(),

    strike: int('strike').notNull().default(0),

    timeLimit: int('time_limit').notNull(),
    startedAt: datetime('started_at').notNull(),
    finishedAt: datetime('finished_at'),

    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('siswa_idx').on(table.siswaId),
    index('jadwal_idx').on(table.jadwalId),
]);

export const pengerjaanJawabanTable = mysqlTable('pengerjaan_jawaban', {
    id: varchar('id', { length: 255 }).primaryKey(),
    pengerjaanId: varchar('pengerjaan_id', { length: 255 }).notNull(),
    soalId: varchar('soal_id', { length: 255 }).notNull(),
    jawabanSoalId: varchar('jawaban_soal_id', { length: 255 }),
    value: varchar('value', { length: 4096 }),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('pengerjaan_idx').on(table.pengerjaanId),
    index('soal_idx').on(table.soalId),
]);

export const pengerjaanMarkerTable = mysqlTable('pengerjaan_marker', {
    id: varchar('id', { length: 255 }).primaryKey(),
    pengerjaanId: varchar('pengerjaan_id', { length: 255 }).notNull(),
    soalId: varchar('soal_id', { length: 255 }).notNull(),
    isMarked: boolean('is_marked').notNull().default(false),
}, (table) => [
    index('pengerjaan_idx').on(table.pengerjaanId),
    index('soal_idx').on(table.soalId),
]);

export const pengerjaanEventTable = mysqlTable('pengerjaan_event', {
    id: varchar('id', { length: 255 }).primaryKey(),
    pengerjaanId: varchar('pengerjaan_id', { length: 255 }).notNull(),
    eventType: varchar('event_type', { length: 255 }).notNull(),
    payload: text('payload').notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
}, (table) => [
    index('pengerjaan_idx').on(table.pengerjaanId),
]);
