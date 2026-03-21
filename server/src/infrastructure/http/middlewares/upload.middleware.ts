import multer from 'multer';

const memoryStorage = multer.memoryStorage();

function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  if (!file.mimetype.startsWith('image/')) {
    callback(new Error('Only image files are allowed'));
    return;
  }

  callback(null, true);
}

export const upload = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
});
