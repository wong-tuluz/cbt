import { mysqlTable, varchar, datetime, text, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { int } from 'drizzle-orm/mysql-core';

export const acaraTable = mysqlTable('acara', {
    id: varchar('id', { length: 255 }).primaryKey(),
    remoteId: varchar('remote_id', { length: 255 }), // Backoffice Event ID
    title: varchar('title', { length: 255 }).notNull(),
    startTime: datetime('start_time').notNull(),
    endTime: datetime('end_time').notNull(),
    description: text('description').default('').notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});

export const acaraSiswaTable = mysqlTable('acara_siswa', {
    id: varchar('id', { length: 255 }).primaryKey(),
    remoteId: varchar('remote_id', { length: 255 }), // Backoffice id_peserta_perevent
    acaraId: varchar('acara_id', { length: 255 }).notNull(),
    siswaId: varchar('siswa_id', { length: 255 }).notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('acara_idx').on(table.acaraId),
    index('siswa_idx').on(table.siswaId),
    index('remote_idx').on(table.remoteId),
]);

export const jadwalTable = mysqlTable('jadwal', {
    id: varchar('id', { length: 255 }).primaryKey(),
    remoteId: varchar('remote_id', { length: 255 }), // Backoffice Jadwal ID
    acaraId: varchar('acara_id', { length: 255 }).notNull(),
    paketSoalId: varchar('paket_soal_id', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    startTime: datetime('start_time').notNull(),
    endTime: datetime('end_time').notNull(),
    timeLimit: int('time_limit').notNull(),
    attempts: int('attempts').notNull(),
    token: varchar('token', { length: 36 }).notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('acara_idx').on(table.acaraId),
    index('remote_idx').on(table.remoteId),
]);
