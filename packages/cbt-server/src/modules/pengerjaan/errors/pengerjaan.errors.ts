export class SessionExpiredError extends Error {
    constructor(message = 'Session expired') {
        super(message);
        this.name = 'SessionExpiredError';
    }
}

export class SessionStaleError extends Error {
    constructor(message = 'Session stale') {
        super(message);
        this.name = 'SessionStaleError';
    }
}

export class SessionAccessDeniedError extends Error {
    constructor(message = 'Tidak ada akses') {
        super(message);
        this.name = 'SessionAccessDeniedError';
    }
}
