import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// JWT 인증 후 request.user에 담기는 페이로드 타입
export interface JwtPayload {
  id: string;
  email: string;
}

// 인증된 사용자 정보를 컨트롤러에서 쉽게 꺼내는 데코레이터
// 사용법: @CurrentUser() user: JwtPayload
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as JwtPayload;
  },
);
