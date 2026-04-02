import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsString()
  eventName!: string;

  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;
}
