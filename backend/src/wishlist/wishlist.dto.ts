import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'The ID of the product variant to add to the wishlist',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  variantId!: string;

  @ApiProperty({
    description: 'The image URL of the product at the time of wishlisting',
    required: false,
  })
  @IsNotEmpty()
  @IsOptional()
  image?: string;
}
