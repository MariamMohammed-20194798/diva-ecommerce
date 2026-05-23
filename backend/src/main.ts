import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as express from 'express';

function parseAllowedOrigins(): Set<string> {
  const raw = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    'https://ecommerce-app-omega-hazel.vercel.app',
  ];

  return new Set(
    raw
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => value.split(','))
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean),
  );
}

function isVercelDeploymentOrigin(origin: string): boolean {
  return /^https:\/\/[\w-]+\.vercel\.app$/i.test(origin);
}

function isLocalDevOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const allowedOrigins = parseAllowedOrigins();

  app.use(helmet());
  app.use(cookieParser());
  app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(null, true);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const normalized = origin.replace(/\/$/, '');

      if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        allowedOrigins.has(normalized) ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        isVercelDeploymentOrigin(normalized) ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(normalized))
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(null, origin);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
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
