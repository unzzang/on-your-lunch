import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 이 데코레이터가 붙은 엔드포인트는 JWT 인증 없이 접근 가능하다.
 * 사용법: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
