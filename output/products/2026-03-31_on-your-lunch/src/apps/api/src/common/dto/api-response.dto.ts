import { ApiProperty } from '@nestjs/swagger';

/** Swagger용 에러 상세 */
export class ApiErrorDetailDto {
  @ApiProperty({ description: '에러 코드', example: 'VALIDATION_ERROR' })
  code!: string;

  @ApiProperty({ description: '에러 메시지', example: '유효하지 않은 요청입니다' })
  message!: string;
}

/** Swagger용 에러 응답 래퍼 */
export class ApiErrorResponseDto {
  @ApiProperty({ description: '성공 여부', example: false })
  success!: false;

  @ApiProperty({ description: '에러 상세', type: ApiErrorDetailDto })
  error!: ApiErrorDetailDto;
}

/** Swagger용 페이지네이션 메타 */
export class PaginationMetaDto {
  @ApiProperty({ description: '현재 페이지', example: 1 })
  page!: number;

  @ApiProperty({ description: '페이지당 항목 수', example: 20 })
  limit!: number;

  @ApiProperty({ description: '전체 항목 수', example: 42 })
  totalCount!: number;

  @ApiProperty({ description: '전체 페이지 수', example: 3 })
  totalPages!: number;

  @ApiProperty({ description: '다음 페이지 존재 여부', example: true })
  hasNext!: boolean;
}
