import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  buildingName?: string;
}
