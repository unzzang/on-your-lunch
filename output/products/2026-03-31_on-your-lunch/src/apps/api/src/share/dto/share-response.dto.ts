import { ApiProperty } from '@nestjs/swagger';

/** 공유 링크 응답 DTO (data 필드 안에 반환) */
export class ShareLinkResponseDto {
  @ApiProperty({ description: '공유 URL', example: 'https://on-your-lunch.app/share/restaurant/rest-1' })
  shareUrl!: string;
}
