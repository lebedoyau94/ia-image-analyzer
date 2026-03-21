import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AIProviderError } from '../../adapters/OpenAIAdapter';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }

  if (error instanceof Error && error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }

  if (error instanceof AIProviderError) {
    return res.status(502).json({
      message: 'AI provider error',
      code: error.code,
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}
