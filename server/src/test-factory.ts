import 'dotenv/config';
import { AIProviderFactory } from './infrastructure/factories/AIProviderFactory';

function run(): void {
  const provider = AIProviderFactory.create();
  console.log(`Factory funcionando: ${provider.constructor.name}`);
}

run();
