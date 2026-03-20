import { ImageTag } from '../entities/ImageTag';
export interface IAIProvider {
  analyzeImage(imageBuffer: Buffer): Promise<ImageTag[]>;
}
