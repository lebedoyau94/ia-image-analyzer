import { ImageTag } from '../../domain/entities/ImageTag';
import { IAIProvider } from '../../domain/ports/IAIProvider';

export class AnalyzeImageUseCase {
  constructor(private readonly aiProvider: IAIProvider) {}

  async execute(imageBuffer: Buffer): Promise<ImageTag[]> {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Image buffer is required');
    }

    return this.aiProvider.analyzeImage(imageBuffer);
  }
}
