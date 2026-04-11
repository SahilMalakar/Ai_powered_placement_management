import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors/AppError.js';
import { sendError } from '../utils/ApiResonse.js';

export const errorMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    let error: AppError;

    // for unknown error
    if (err instanceof AppError) {
        error = err;
    } else {
        const message =
            err instanceof Error ? err.message : 'Internal Server Error';
        error = new AppError(message, 500, 'INTERNAL_ERROR', false);
    }

    // Prisma unique constraint check
    if (
        err instanceof Error &&
        'code' in err &&
        (err as Record<string, unknown>).code === 'P2002'
    ) {
        error = new AppError('Duplicate field value', 409, 'UNIQUE_CONSTRAINT');
    }

    const stackArray = error.stack
        ? error.stack
              .split('\n')
              .map((line: string) => line.trim())
              .filter(Boolean)
        : [];

    console.error({
        message: error.message,
        errorCode: error.errorCode,
        statusCode: error.statusCode,
        path: req.originalUrl,
        method: req.method,
        stack: stackArray,
    });

    return sendError(
        res,
        error.message,
        error.statusCode,
        error.errorCode,
        error.stack
    );
};
