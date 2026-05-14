import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://ecommerce-app-omega-hazel.vercel.app/"
    ],
    credentials: true,
    exposedHeaders: ['x-session-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: true,
      transform: true, // auto-convert types
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  console.log(`Backend running on port ${process.env.PORT ?? 3001}`);
}
void bootstrap();
