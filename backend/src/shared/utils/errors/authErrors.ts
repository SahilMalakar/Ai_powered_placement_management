import { AppError } from './AppError.js';

export class InvalidCredentialsError extends AppError {
    constructor(message = 'Invalid credentials') {
        super(message, 401, 'INVALID_CREDENTIALS');
    }
}

export class TokenExpiredError extends AppError {
    constructor(message = 'Token expired') {
        super(message, 401, 'TOKEN_EXPIRED');
    }
}
