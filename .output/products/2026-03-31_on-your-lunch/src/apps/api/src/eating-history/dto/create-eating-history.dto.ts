import { IsString, IsInt, Min, Max, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export class CreateEatingHistoryDto {
  @IsString()
  restaurantId!: string;

  @IsDateString()
  eatenDate!: string; // YYYY-MM-DD

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  memo?: string;

  @IsBoolean()
  isFromRecommendation!: boolean;
}
