import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  /** GET /v1 — 서버 상태 웰컴 응답 [Public] */
  @Public()
  @Get()
  getRoot() {
    return {
      service: '온유어런치 API',
      version: '0.1.0',
      status: 'running',
      docs: '/api-docs',
    };
  }
}
