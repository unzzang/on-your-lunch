import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 10)
  @Matches(/^[가-힣a-zA-Z0-9]+$/, { message: '닉네임은 한글, 영문, 숫자만 가능합니다.' })
  nickname?: string;
}
