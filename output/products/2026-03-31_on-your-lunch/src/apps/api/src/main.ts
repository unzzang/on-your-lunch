import { existsSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '../../.env');
if (existsSync(envPath)) {
  config({ path: envPath, override: true });
}

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // /health 엔드포인트 (globalPrefix 바깥)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.setGlobalPrefix('v1');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('온유어런치 API')
    .setDescription('직장인 점심 추천 서비스 API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`서버: http://localhost:${port}/v1`);
  logger.log(`Swagger: http://localhost:${port}/api-docs`);
}

bootstrap();
