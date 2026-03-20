import { ImageTag } from '../../domain/entities/ImageTag';
import { IAIProvider } from '../../domain/ports/IAIProvider';

interface OpenAIResponse {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: 'AI_PROVIDER_UNAVAILABLE' | 'AI_INVALID_RESPONSE',
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class OpenAIAdapter implements IAIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.API_KEY ?? '';
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
    this.baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

    if (!this.apiKey) {
      throw new AIProviderError(
        'Missing API_KEY for OpenAI adapter',
        'AI_PROVIDER_UNAVAILABLE',
      );
    }
  }

  async analyzeImage(imageBuffer: Buffer): Promise<ImageTag[]> {
    const imageBase64 = imageBuffer.toString('base64');

    try {
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text:
                    'Return only a JSON array of tags for this image. ' +
                    'Each item must include: label (string), confidence (0 to 1 number).',
                },
                {
                  type: 'input_image',
                  image_url: `data:image/jpeg;base64,${imageBase64}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new AIProviderError(
          `OpenAI request failed with status ${response.status}`,
          'AI_PROVIDER_UNAVAILABLE',
        );
      }

      const data = (await response.json()) as OpenAIResponse;
      const outputText =
        data.output?.flatMap((item) => item.content ?? []).find((content) => content.type === 'output_text')
          ?.text ?? '';

      if (!outputText) {
        throw new AIProviderError(
          'OpenAI response does not include output text',
          'AI_INVALID_RESPONSE',
        );
      }

      const parsed = JSON.parse(outputText) as Array<{
        label: unknown;
        confidence: unknown;
      }>;

      if (!Array.isArray(parsed)) {
        throw new AIProviderError('OpenAI output is not an array', 'AI_INVALID_RESPONSE');
      }

      return parsed
        .filter(
          (item) =>
            typeof item.label === 'string' &&
            typeof item.confidence === 'number' &&
            item.confidence >= 0 &&
            item.confidence <= 1,
        )
        .map((item) => ({
          label: item.label as string,
          confidence: item.confidence as number,
        }));
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIProviderError(
        'Unexpected error while analyzing image with OpenAI',
        'AI_PROVIDER_UNAVAILABLE',
      );
    }
  }
}
