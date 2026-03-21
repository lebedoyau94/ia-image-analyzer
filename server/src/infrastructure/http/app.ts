import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/ErrorHandler';
import { analyzeRouter } from './routes/analyze.routes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api', analyzeRouter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(errorHandler);

  return app;
}
