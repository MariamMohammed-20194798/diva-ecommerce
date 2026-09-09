import { IsUUID, IsInt, IsOptional, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ description: 'Product variant UUID' })
  @IsUUID()
  variantId!: string;

  @ApiProperty({ description: 'Quantity to add', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Custom print data: text, design, position, colors',
    example: { text: 'My Name', position: 'front', color: '#ffffff' },
  })
  @IsOptional()
  @IsObject()
  customization?: Record<string, unknown>;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity (0 removes the item)', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  quantity!: number;
}
