import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return { service: 'on-your-lunch', version: '1.0.0' };
  }
}
