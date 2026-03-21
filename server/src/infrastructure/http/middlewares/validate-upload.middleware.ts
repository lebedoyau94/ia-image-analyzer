import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const uploadSchema = z.object({
  mimetype: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({
      message: 'Invalid file type. Allowed: image/jpeg, image/png, image/webp.',
    }),
  }),
  size: z
    .number()
    .max(MAX_FILE_SIZE_BYTES, 'File size must be less than or equal to 5MB.'),
});

export function validateUpload(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.file) {
    next(
      new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          message: 'Image file is required (field: image).',
          path: ['file'],
        },
      ]),
    );
    return;
  }

  const parsed = uploadSchema.safeParse({
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  if (!parsed.success) {
    next(parsed.error);
    return;
  }

  next();
}
