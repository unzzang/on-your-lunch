import { IsBoolean, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationDto {
  @ApiProperty({ description: '알림 활성화 여부', example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ description: '알림 시간 (HH:mm 형식)', example: '11:30' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'time은 HH:mm 형식이어야 합니다 (예: 11:30)' })
  time!: string;
}
