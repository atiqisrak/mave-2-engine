import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 7845;
  await app.listen(port);

  console.log(`
  🚀 Mave CMS is running!
  
  📍 API:      http://localhost:${port}/api
  🎮 GraphQL:  http://localhost:${port}/graphql
  📊 Health:   http://localhost:${port}/api/health
  
  Environment: ${process.env.NODE_ENV}
  `);
}

bootstrap();
