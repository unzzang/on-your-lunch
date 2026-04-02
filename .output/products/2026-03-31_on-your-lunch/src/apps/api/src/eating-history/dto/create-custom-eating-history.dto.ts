import { IsString, IsInt, Min, Max, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateCustomEatingHistoryDto {
  @IsString()
  restaurantName!: string;

  @IsString()
  categoryId!: string;

  @IsDateString()
  eatenDate!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  memo?: string;
}
