import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import express from 'express';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import {
  ApiProtectedEndpointErrors,
  ApiValidationErrorResponse,
} from '../common/swagger/api-responses';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(SWAGGER_BEARER_NAME)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  private getUserId(req: express.Request) {
    const user = req.user as { sub: string; id: string };
    return user.sub ?? user.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  @ApiOkResponse({ description: 'List of wishlist items' })
  @ApiProtectedEndpointErrors()
  async getWishlist(@Req() req: express.Request) {
    const userId = this.getUserId(req);
    return this.wishlistService.getWishlist(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to wishlist' })
  @ApiCreatedResponse({ description: 'Item added to wishlist' })
  @ApiValidationErrorResponse()
  @ApiProtectedEndpointErrors()
  @ApiBody({
    type: AddToWishlistDto,
    examples: {
      default: {
        summary: 'Add variant to wishlist',
        value: {
          variantId: '550e8400-e29b-41d4-a716-446655440002',
          image: 'https://cdn.example.com/products/tee-black.jpg',
        },
      },
    },
  })
  async addToWishlist(
    @Body() dto: AddToWishlistDto,
    @Req() req: express.Request,
  ) {
    const userId = this.getUserId(req);
    return this.wishlistService.addToWishlist(userId, dto.variantId, dto.image);
  }

  @Delete(':variantId')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  @ApiParam({ name: 'variantId', description: 'Product variant UUID' })
  @ApiOkResponse({ description: 'Item removed from wishlist' })
  @ApiNotFoundResponse({ description: 'Wishlist item not found' })
  @ApiProtectedEndpointErrors()
  async removeFromWishlist(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Req() req: express.Request,
  ) {
    const userId = this.getUserId(req);
    return this.wishlistService.removeFromWishlist(userId, variantId);
  }

  @Get('status/:variantId')
  @ApiOperation({ summary: 'Check if item is in wishlist' })
  @ApiParam({ name: 'variantId', description: 'Product variant UUID' })
  @ApiOkResponse({
    description: 'Wishlist status',
    schema: { example: { inWishlist: true } },
  })
  @ApiProtectedEndpointErrors()
  async checkStatus(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Req() req: express.Request,
  ) {
    const userId = this.getUserId(req);
    return this.wishlistService.checkWishlistStatus(userId, variantId);
  }
}
