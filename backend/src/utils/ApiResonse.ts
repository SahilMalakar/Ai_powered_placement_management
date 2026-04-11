import type { Response } from 'express';

export const sendSuccess = (
    res: Response,
    data: unknown = null,
    message = 'Success',
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const sendError = (
    res: Response,
    message = 'Internal Server Error',
    statusCode = 500,
    errorCode = 'INTERNAL_ERROR',
    stack?: string
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errorCode,
        ...(process.env.NODE_ENV === 'development' && { stack }),
    });
};
