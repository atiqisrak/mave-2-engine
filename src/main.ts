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
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['*'];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in the allowed list
      if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log the rejected origin for debugging
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', corsOrigins);
      
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
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
