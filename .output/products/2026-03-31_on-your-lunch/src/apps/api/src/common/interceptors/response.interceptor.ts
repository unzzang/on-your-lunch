import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 모든 응답을 { success: true, data: ... } 형식으로 래핑한다.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, { success: boolean; data: T }> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ success: boolean; data: T }> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
