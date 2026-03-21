import 'dotenv/config';
import { createApp } from './infrastructure/http/app';
import { checkEnv } from './infrastructure/utils/check-env';

checkEnv();
const app = createApp();
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
