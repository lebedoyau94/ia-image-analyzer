import { Router } from 'express';
import { AnalyzeImageController } from '../controllers/AnalyzeImageController';
import { upload } from '../middlewares/upload.middleware';
import { validateUpload } from '../middlewares/validate-upload.middleware';

const analyzeRouter = Router();
const controller = new AnalyzeImageController();

analyzeRouter.post(
  '/analyze',
  upload.single('image'),
  validateUpload,
  async (req, res, next) => {
    try {
      await controller.handle(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { analyzeRouter };
