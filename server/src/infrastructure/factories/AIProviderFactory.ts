import { IAIProvider } from '../../domain/ports/IAIProvider';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';

export class AIProviderFactory {
  static create(): IAIProvider {
    const provider = process.env.AI_PROVIDER;

    if (!provider) {
      throw new Error(
        'Missing AI_PROVIDER environment variable. Supported providers: OPENAI.',
      );
    }

    if (provider === 'OPENAI') {
      return new OpenAIAdapter();
    }

    throw new Error(
      `Unsupported AI provider "${provider}". Supported providers: OPENAI.`,
    );
  }
}
