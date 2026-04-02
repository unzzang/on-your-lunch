import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEatingHistoryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  memo?: string;
}
