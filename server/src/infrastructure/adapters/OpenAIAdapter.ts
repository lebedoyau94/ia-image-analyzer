import axios from 'axios';
import { ImageTag } from '../../domain/entities/ImageTag';
import { IAIProvider } from '../../domain/ports/IAIProvider';

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
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
      const response = await axios.post<OpenAIResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text:
                    'Analyze this image and provide tags with confidence. ' +
                    'Return ONLY a valid JSON array. No markdown, no explanations. ' +
                    'Each item must include: label (string), confidence (number from 0 to 1).',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        },
        {
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;
      const outputText = data.choices?.[0]?.message?.content ?? '';

      if (!outputText) {
        throw new AIProviderError(
          'OpenAI response does not include output text',
          'AI_INVALID_RESPONSE',
        );
      }

      const cleanedOutput = outputText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanedOutput) as Array<{
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
      if (axios.isAxiosError(error)) {
        const axiosError = error as unknown as {
          message?: string;
          response?: { status?: number };
        };
        const status = axiosError.response?.status;
        const errorMessage = axiosError.message ?? 'OpenAI request error';
        console.error(`[OpenAIAdapter] ${errorMessage} (status: ${status ?? 'N/A'})`);

        const message =
          status != null
            ? `OpenAI request failed with status ${status}`
            : 'OpenAI request failed due to network or timeout';
        throw new AIProviderError(message, 'AI_PROVIDER_UNAVAILABLE');
      }

      if (error instanceof AIProviderError) {
        console.error(`[OpenAIAdapter] ${error.message}`);
        throw error;
      }

      const fallbackMessage =
        error instanceof Error ? error.message : 'Unexpected unknown error';
      console.error(`[OpenAIAdapter] ${fallbackMessage}`);

      throw new AIProviderError(
        'Unexpected error while analyzing image with OpenAI',
        'AI_PROVIDER_UNAVAILABLE',
      );
    }
  }
}
