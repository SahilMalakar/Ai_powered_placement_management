import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../utils/errors/AppError.js';

const formatZodError = (issues: any[]) => {
    const message = issues.map((e) => e.message).join(', ');

    const fields = issues.map((e) => e.path.join('.'));

    return { message, fields };
};

export const validateRequest =
    (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
        console.log(
            `hello from Request middleware :${JSON.stringify(req.body)} `
        );

        const result = schema.safeParse(req.body);

        if (!result.success) {
            const { message, fields } = formatZodError(result.error.issues);

            return next(new ValidationError(message, fields));
        }

        req.body = result.data as Request['body'];
        next();
    };

export const validateParams =
    (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
        console.log(
            `hello from Params middleware :${JSON.stringify(req.params)} `
        );
        const result = schema.safeParse(req.params);

        if (!result.success) {
            const { message, fields } = formatZodError(result.error.issues);

            return next(new ValidationError(message, fields));
        }

        req.params = result.data as Request['params'];

        next();
    };

export const validateQuery =
    (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
        console.log(
            `hello from Query middleware :${JSON.stringify(req.query)} `
        );
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const { message, fields } = formatZodError(result.error.issues);

            return next(new ValidationError(message, fields));
        }

        req.query = result.data as Request['query'];

        next();
    };
