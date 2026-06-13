import { AppError } from './AppError.js';

export class JobFailedError extends AppError {
    constructor(message = 'Job processing failed') {
        super(message, 500, 'JOB_FAILED', false);
    }
}

export class JobTimeoutError extends AppError {
    constructor(message = 'Job timeout') {
        super(message, 500, 'JOB_TIMEOUT', false);
    }
}
