import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Product UUID to review' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Rating from 1 to 5', example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Optional written feedback',
    example: 'Excellent quality! Would definitely buy again.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  body?: string;
}

export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['productId'] as const),
) {
  @ApiPropertyOptional({ description: 'Rating from 1 to 5', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Updated written feedback',
    example: 'Updated review: still very good overall.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  body?: string;
}
