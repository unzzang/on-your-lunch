import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 글로벌 prefix: /v1
  app.setGlobalPrefix('v1');

  // 유효성 검증 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 글로벌 인터셉터 (표준 응답 래핑)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 글로벌 예외 필터
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS 설정
  app.enableCors();

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('온유어런치 API')
    .setDescription('직장인 점심 메뉴 추천 앱 API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`온유어런치 API 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`Swagger 문서: http://localhost:${port}/api-docs`);
}
bootstrap();
