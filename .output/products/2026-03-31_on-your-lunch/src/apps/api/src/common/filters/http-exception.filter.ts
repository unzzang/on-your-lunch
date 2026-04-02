import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '@on-your-lunch/shared-types';

// NestJS의 exception response 구조를 위한 인터페이스
interface ExceptionResponseObject {
  code?: string;
  error?: string;
  message?: string | string[];
}

// 모든 에러를 { success: false, error: { code, message } } 형태로 변환
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL_ERROR;
    let message = '서버 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as ExceptionResponseObject;
        code = res.code ?? res.error ?? ErrorCode.INTERNAL_ERROR;
        const rawMessage = res.message ?? exception.message;

        // ValidationPipe 에러는 message가 배열일 수 있음
        message = Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : rawMessage;
      } else {
        message = exception.message;
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json({
      success: false,
      error: { code, message },
    });
  }
}
