import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Occasion {
  WEDDING = 'wedding',
  BUSINESS = 'business',
  CASUAL = 'casual',
  COCKTAIL = 'cocktail',
  BEACH = 'beach',
  DINNER = 'dinner',
  PARTY = 'party',
  GYM = 'gym',
  DATE_NIGHT = 'date_night',
  BRUNCH = 'brunch',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  ALL = 'all',
}

export enum StylePreference {
  ELEGANT = 'elegant',
  CASUAL = 'casual',
  BOHEMIAN = 'bohemian',
  MINIMALIST = 'minimalist',
  SPORTY = 'sporty',
  ROMANTIC = 'romantic',
  EDGY = 'edgy',
  CLASSIC = 'classic',
  LUXURY = 'luxury',
  STREETWEAR = 'streetwear',
}

export enum BodyType {
  HOURGLASS = 'hourglass',
  PEAR = 'pear',
  APPLE = 'apple',
  RECTANGLE = 'rectangle',
  INVERTED_TRIANGLE = 'inverted_triangle',
}

// ─── Request DTO ──────────────────────────────────────────────────────────────

export class GenerateOutfitDto {
  @ApiProperty({ enum: Occasion, example: Occasion.WEDDING })
  @IsEnum(Occasion)
  occasion: Occasion;

  @ApiProperty({ enum: Season, example: Season.SUMMER })
  @IsEnum(Season)
  season: Season;

  @ApiProperty({ enum: StylePreference, example: StylePreference.ELEGANT })
  @IsEnum(StylePreference)
  style: StylePreference;

  @ApiPropertyOptional({
    description: 'Preferred color (e.g. black, navy, blush)',
    example: 'black',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredColor?: string;

  @ApiPropertyOptional({
    description: 'Maximum budget in cents (e.g. 15000 = $150)',
    example: 15000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  budgetCents?: number;

  @ApiPropertyOptional({ enum: BodyType })
  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @ApiPropertyOptional({
    description: 'Number of outfit combinations to generate (1–3)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(3)
  outfitCount?: number = 1;

  @ApiPropertyOptional({
    description:
      'Free-text description of the look (e.g. "flowy and romantic")',
    example: 'Something flowy and romantic for a garden ceremony',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  freeText?: string;
}

export class CompleteTheLookDto {
  @ApiProperty({
    description: 'UUID of the anchor product to build the look around',
  })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ enum: Occasion })
  @IsOptional()
  @IsEnum(Occasion)
  occasion?: Occasion;

  @ApiPropertyOptional({
    description: 'Budget for the accessory suggestions only, in cents',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  budgetCents?: number;
}
