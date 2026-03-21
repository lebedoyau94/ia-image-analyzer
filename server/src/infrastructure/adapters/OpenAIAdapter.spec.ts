import axios, { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIProviderError, OpenAIAdapter } from './OpenAIAdapter';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('OpenAIAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-api-key';
    process.env.OPENAI_MODEL = 'gpt-4.1-mini';
    process.env.OPENAI_BASE_URL = 'https://api.openai.com/v1';
  });

  it('returns tags on successful response', async () => {
    const adapter = new OpenAIAdapter();
    const imageBuffer = Buffer.from('fake-image-content');

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content:
                '[{"label":"cat","confidence":0.98},{"label":"pet","confidence":0.91}]',
            },
          },
        ],
      },
    });

    const result = await adapter.analyzeImage(imageBuffer);

    expect(result).toEqual([
      { label: 'cat', confidence: 0.98 },
      { label: 'pet', confidence: 0.91 },
    ]);
  });

  it('handles 401 unauthorized from OpenAI', async () => {
    const adapter = new OpenAIAdapter();
    const imageBuffer = Buffer.from('fake-image-content');

    const axiosError = {
      isAxiosError: true,
      response: {
        status: 401,
      },
    } as AxiosError;

    mockedAxios.post.mockRejectedValueOnce(axiosError);

    await expect(adapter.analyzeImage(imageBuffer)).rejects.toMatchObject({
      name: 'AIProviderError',
      code: 'AI_PROVIDER_UNAVAILABLE',
      message: 'OpenAI request failed with status 401',
    } satisfies Partial<AIProviderError>);
  });

  it('handles malformed JSON content from AI response', async () => {
    const adapter = new OpenAIAdapter();
    const imageBuffer = Buffer.from('fake-image-content');

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: '```json\n[{"label":"cat","confidence":0.98}\n```',
            },
          },
        ],
      },
    });

    await expect(adapter.analyzeImage(imageBuffer)).rejects.toMatchObject({
      name: 'AIProviderError',
      code: 'AI_PROVIDER_UNAVAILABLE',
    } satisfies Partial<AIProviderError>);
  });
});
