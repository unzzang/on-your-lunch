import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '닉네임 (2~10자)', example: '점심러버', minLength: 2, maxLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  nickname?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL', example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string | null;
}
