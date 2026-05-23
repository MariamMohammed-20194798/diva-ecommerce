import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtpType } from '@prisma/client';

export class SendOtpDto {
  @ApiProperty({
    description: 'Email address to send the one-time password to',
    example: 'customer@diva.shop',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'OTP flow type — LOGIN for existing users, SIGNUP for new accounts',
    enum: OtpType,
    example: OtpType.LOGIN,
  })
  @IsEnum(OtpType)
  type: OtpType;

  @ApiPropertyOptional({
    description: 'Display name (required for SIGNUP)',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
