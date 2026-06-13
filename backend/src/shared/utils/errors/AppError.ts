export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public errorCode?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode?: string,
        isOperational: boolean = true
    ) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (errorCode !== undefined) {
            this.errorCode = errorCode;
        }

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(
        message: string,
        public fields: string[]
    ) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}
