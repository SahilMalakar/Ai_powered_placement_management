import { AppError } from './AppError.js';

export class RequestValidationError extends AppError {
    public fields: Record<string, unknown>;

    constructor(
        message = 'Invalid request data',
        fields?: Record<string, unknown>
    ) {
        super(message, 422, 'VALIDATION_ERROR');
        this.fields = fields ?? {};
    }
}
