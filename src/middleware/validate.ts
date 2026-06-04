import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { AppError } from '../utils/appError';

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;
      
      // Assign parsed values back to request to benefit from zod transformations (e.g. string to Date)
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors to be cleaner using the issues property
        const formattedErrors = error.issues.map((err) => {
          // e.g. "body.asset" -> "asset"
          const path = err.path.length > 1 ? err.path.slice(1).join('.') : err.path.join('.');
          return `${path}: ${err.message}`;
        });
        
        return next(new AppError(`Validation failed: ${formattedErrors.join('; ')}`, 400));
      }
      next(error);
    }
  };
};
