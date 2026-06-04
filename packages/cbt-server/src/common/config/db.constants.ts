import { mandatory } from "./mandatory";

export const NEST_DRIZZLE_OPTIONS = 'NEST_DRIZZLE_OPTIONS';
export const DRIZZLE_ORM = 'DRIZZLE_ORM';
export const DATABASE_URL = mandatory(process.env.DATABASE_URL, 'DATABASE_URL')
export const JWT_KEY = 'pfsERt6ruYNiGcrlXIaK6PR1Psgyr8XJdjzZfmGFV8VTDG4HY2qzmSTTJrS65sktLzHMtt1KUt8WN84QnWm812Q95ziD0nIxddWIDl2EWgAUs48l4Jq2p2wsvmdWOk13'