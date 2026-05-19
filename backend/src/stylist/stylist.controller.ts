import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { StylistService } from './stylist.service';
import { GenerateOutfitDto, CompleteTheLookDto } from './dto/Stylist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@ApiTags('ai-stylist')
@Controller('stylist')
export class StylistController {
  constructor(private readonly stylistService: StylistService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /stylist/outfit
  //
  // Core endpoint. Accepts user preferences and returns 1–3 complete
  // outfit suggestions built from real products in the database.
  //
  // Flow:
  //   1. Fetch matching products from PostgreSQL (by category, color, budget)
  //   2. Format product catalog
  //   3. Send to Claude with stylist prompt
  //   4. Parse structured JSON response
  //   5. Enrich with real DB product/variant data
  //   6. Return complete outfit cards to frontend
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('outfit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate AI outfit from user preferences',
    description:
      'Fetches real products from the database, then uses Claude AI to ' +
      'intelligently combine them into complete, stylish outfits tailored to ' +
      "the user's occasion, season, style, color, and budget. " +
      'Returns 1–3 outfit suggestions with styling notes, item reasons, and total price.',
  })
  @ApiCreatedResponse({
    description: 'Outfit suggestions generated from real products',
  })
  @ApiBadRequestResponse({
    description: 'No matching products found or invalid preferences',
  })
  generateOutfit(@Body() dto: GenerateOutfitDto) {
    return this.stylistService.generateOutfit(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /stylist/complete-the-look
  //
  // "Complete the Look" — shown on product detail pages.
  // Takes a single anchor product and AI-suggests matching accessories/shoes.
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('complete-the-look')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '"Complete the Look" — AI suggests accessories for a product',
    description:
      'Shown on product detail pages. The user has already chosen an anchor ' +
      'product; this endpoint suggests matching shoes, bags, and accessories ' +
      'from the real database to complete the look. ' +
      'The anchor product is included as item[0] in the response.',
  })
  @ApiCreatedResponse({ description: 'Complementary look generated' })
  @ApiNotFoundResponse({ description: 'Anchor product not found' })
  @ApiBadRequestResponse({ description: 'No complementary products available' })
  completeTheLook(@Body() dto: CompleteTheLookDto) {
    return this.stylistService.completeTheLook(dto);
  }
}