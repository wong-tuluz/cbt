import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL ?? (() => { throw new Error('DATABASE_URL is not defined'); })(),
    timezone: '+00:00',
});

export const db = drizzle(pool);

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];