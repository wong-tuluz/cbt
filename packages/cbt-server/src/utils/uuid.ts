import { v7 as uuidv7 } from 'uuid';
import seedrandom from 'seedrandom';

const rngs = new Map<string, seedrandom.PRNG>();

/**
 * Generates a UUID v7 using a module-specific seed for entropy.
 * 
 * @param moduleSeed The custom seed for the module (e.g. 'soal')
 */
export function generateUuidV7(moduleSeed: string): string {
    let rng = rngs.get(moduleSeed);
    if (!rng) {
        rng = seedrandom(moduleSeed);
        rngs.set(moduleSeed, rng);
    }
    const randomBytes = new Uint8Array(10);
    for (let i = 0; i < 10; i++) {
        randomBytes[i] = Math.floor(rng() * 256);
    }
    return uuidv7({ random: randomBytes });
}
