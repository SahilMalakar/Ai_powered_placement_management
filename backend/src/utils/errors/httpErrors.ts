import { AppError } from './AppError.js';

// 400
export class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 400, 'BAD_REQUEST');
    }
}

// 401
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

// 403
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

// 404
export class NotFoundError extends AppError {
    constructor(message = 'Resource Not Found') {
        super(message, 404, 'NOT_FOUND');
    }
}

// 409
export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409, 'CONFLICT');
    }
}

// 422
export class ValidationError extends AppError {
    constructor(message = 'Validation Failed') {
        super(message, 422, 'VALIDATION_ERROR');
    }
}

// 429
export class RateLimitError extends AppError {
    constructor(message = 'Too Many Requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

// 500
export class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error') {
        super(message, 500, 'INTERNAL_ERROR', false);
    }
}

// 503
export class ServiceUnavailableError extends AppError {
    constructor(message = 'Service Unavailable') {
        super(message, 503, 'SERVICE_UNAVAILABLE', false);
    }
}
