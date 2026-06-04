import { mandatory } from "./mandatory"

export const BETTER_AUTH_SECRET = mandatory(process.env.BETTER_AUTH_SECRET, 'BETTER_AUTH_SECRET')
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL
