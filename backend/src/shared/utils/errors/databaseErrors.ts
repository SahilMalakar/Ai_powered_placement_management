import { AppError } from './AppError.js';

export class DatabaseError extends AppError {
    constructor(message = 'Database Error') {
        super(message, 500, 'DATABASE_ERROR', false);
    }
}

export class UniqueConstraintError extends AppError {
    constructor(message = 'Duplicate value') {
        super(message, 409, 'UNIQUE_CONSTRAINT');
    }
}

export class RecordNotFoundError extends AppError {
    constructor(message = 'Record not found') {
        super(message, 404, 'RECORD_NOT_FOUND');
    }
}

export class QueryTimeoutError extends AppError {
    constructor(message = 'Database query timeout') {
        super(message, 500, 'QUERY_TIMEOUT', false);
    }
}
