import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('STRATIX AI API')
    .setDescription('Premium AI-powered competitive intelligence and positioning platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('projects', 'Project management')
    .addTag('sources', 'Data source management')
    .addTag('ingestion', 'Data ingestion and processing')
    .addTag('context', 'Business context extraction')
    .addTag('competitors', 'Competitor intelligence')
    .addTag('market', 'Market analysis')
    .addTag('reports', 'Report generation and publishing')
    .addTag('admin', 'Admin dashboard and controls')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`✓ API running on http://localhost:${port}`);
  console.log(`✓ API docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
