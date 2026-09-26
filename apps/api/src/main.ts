import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { clerkMiddleware } from '@clerk/express';
import { getApiCorsOptions } from './api-cors.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(getApiCorsOptions(process.env.EXPO_WEB_ORIGIN));
  app.use(clerkMiddleware());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3010);
}
await bootstrap();
