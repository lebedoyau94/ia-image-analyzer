import { Request, Response } from 'express';
import { AnalyzeImageUseCase } from '../../../application/use-cases/AnalyzeImageUseCase';
import { AIProviderFactory } from '../../factories/AIProviderFactory';

export class AnalyzeImageController {
  async handle(req: Request, res: Response): Promise<Response> {
    const aiProvider = AIProviderFactory.create();
    const useCase = new AnalyzeImageUseCase(aiProvider);
    const tags = await useCase.execute(req.file!.buffer);

    return res.status(200).json({ tags });
  }
}
