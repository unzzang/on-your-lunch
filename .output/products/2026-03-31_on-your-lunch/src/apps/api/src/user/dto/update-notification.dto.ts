import { IsBoolean, IsString, IsIn } from 'class-validator';

const ALLOWED_TIMES = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'];

export class UpdateNotificationDto {
  @IsBoolean()
  enabled!: boolean;

  @IsString()
  @IsIn(ALLOWED_TIMES, { message: '알림 시간은 10:00~13:00 사이 30분 단위입니다.' })
  time!: string;
}
