import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * JWT Guard를 통과한 요청에서 현재 사용자 정보를 추출하는 데코레이터.
 * 사용법: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
