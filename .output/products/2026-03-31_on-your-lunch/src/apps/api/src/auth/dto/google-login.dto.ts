import { IsBoolean, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  idToken!: string;

  @IsBoolean()
  termsAgreed!: boolean;

  @IsBoolean()
  marketingAgreed!: boolean;
}
