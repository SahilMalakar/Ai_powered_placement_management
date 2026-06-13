import { AppError } from './AppError.js';

export class ExternalServiceError extends AppError {
    constructor(service: string, message = 'External service failed') {
        super(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', false);
    }
}
