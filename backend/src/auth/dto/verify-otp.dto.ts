import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtpType } from '@prisma/client';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email that received the OTP',
    example: 'customer@diva.shop',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Six-digit OTP code from email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description: 'Must match the type used in send-otp',
    enum: OtpType,
    example: OtpType.LOGIN,
  })
  @IsEnum(OtpType)
  type: OtpType;

  @ApiPropertyOptional({
    description: 'Display name when completing SIGNUP',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
