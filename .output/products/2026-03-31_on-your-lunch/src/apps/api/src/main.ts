import { config } from 'dotenv';
import { resolve } from 'path';

// 루트 .env 로드 (Prisma, JWT 등에서 사용)
// 반드시 다른 모듈 import 전에 실행해야 process.env가 채워진다
// process.cwd()는 항상 apps/api/ 이므로, ../../.env로 워크스페이스 루트의 .env를 참조
config({ path: resolve(process.cwd(), '../../.env'), override: true });

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // globalPrefix 바깥의 헬스체크 엔드포인트 — Railway 배포 시 사용
  // /health로 접근 가능 (v1 prefix 적용 안 됨)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 모든 API 경로 앞에 /v1을 붙임 (예: /v1/categories)
  app.setGlobalPrefix('v1');

  // CORS 허용 -- 프론트엔드(다른 포트)에서 API를 호출할 수 있게
  app.enableCors();

  // 요청 데이터 자동 유효성 검증
  // whitelist: true -> DTO에 없는 필드는 자동 제거
  // transform: true -> 쿼리 파라미터 문자열을 숫자/불리언으로 자동 변환
  // forbidNonWhitelisted: true -> DTO에 없는 필드가 오면 400 에러
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger UI 설정 — http://localhost:3000/api-docs
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

  logger.log(`서버가 http://localhost:${port}/v1 에서 실행 중입니다`);
  logger.log(`Swagger: http://localhost:${port}/api-docs`);
}

bootstrap();
