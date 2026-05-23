import {
  IsUUID,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: "Shipping address UUID from the user's saved addresses",
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  addressId: string;

  @ApiPropertyOptional({
    description: 'Optional discount code to apply at checkout',
    example: 'SUMMER20',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  discountCode?: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({
    description:
      'Stripe PaymentIntent id returned after client-side confirmation (e.g. pi_3abc123)',
    example: 'pi_3QexampleStripePaymentIntentId',
  })
  @IsString()
  @MinLength(3)
  paymentIntentId: string;
}
