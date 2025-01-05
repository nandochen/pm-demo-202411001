import { NestFactory } from '@nestjs/core';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // const server = express();
  // const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(server));
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  // app.setGlobalPrefix('api');

  // 設置靜態檔案目錄
  // server.use(express.static('/dist'));

  await app.listen(3000);
}

bootstrap();
