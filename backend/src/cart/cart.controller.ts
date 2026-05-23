import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';

import { randomUUID } from 'crypto';

import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

import * as authRequest from '../common/types/auth-request';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import { ApiValidationErrorResponse } from '../common/swagger/api-responses';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getAuthUserId(req: authRequest.AuthRequest): string | undefined {
    return req.user?.sub ?? req.user?.id;
  }

  private resolveSessionId(
    req: authRequest.AuthRequest,
    userId?: string,
  ): string | undefined {
    if (userId) return undefined;

    const headerSessionId = req.headers['x-session-id'];

    const normalizedHeader =
      typeof headerSessionId === 'string'
        ? headerSessionId
        : Array.isArray(headerSessionId)
          ? headerSessionId[0]
          : undefined;

    return req.cookies?.session_id ?? normalizedHeader ?? randomUUID();
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({
    summary: 'Get current cart',
    description:
      'Works for guests (x-session-id header or cookie) and authenticated users (JWT). ' +
      'Guest responses include x-session-id when a new session is created.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Guest session id (returned on first cart request if omitted)',
  })
  @ApiOkResponse({
    description: 'Cart with items, subtotal, and itemCount',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440010',
        items: [],
        subtotal: 0,
        itemCount: 0,
      },
    },
  })
  async getCart(@Req() req: authRequest.AuthRequest) {
    const userId = this.getAuthUserId(req);

    const sessionId = this.resolveSessionId(req, userId);

    if (!userId && sessionId) {
      req.res?.setHeader('x-session-id', sessionId);
    }

    return this.cartService.getCart(userId, sessionId);
  }

  @Post('items')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      'Adds a product variant with optional customization to the cart.',
  })
  @ApiCreatedResponse({ description: 'Updated cart after add' })
  @ApiBadRequestResponse({
    description: 'Invalid variant or insufficient stock',
  })
  @ApiValidationErrorResponse()
  @ApiBody({
    type: AddCartItemDto,
    examples: {
      default: {
        summary: 'Add variant to cart',
        value: {
          variantId: '550e8400-e29b-41d4-a716-446655440002',
          quantity: 1,
          customization: { text: 'DIVA', position: 'front', color: '#ffffff' },
        },
      },
    },
  })
  async addItem(
    @Body() dto: AddCartItemDto,
    @Req() req: authRequest.AuthRequest,
  ) {
    const userId = this.getAuthUserId(req);

    const sessionId = this.resolveSessionId(req, userId);

    if (!userId && sessionId) {
      req.res?.setHeader('x-session-id', sessionId);
    }

    return this.cartService.addItem(dto, userId, sessionId);
  }

  @Patch('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart item UUID' })
  @ApiOkResponse({ description: 'Updated cart' })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  @ApiValidationErrorResponse()
  @ApiBody({
    type: UpdateCartItemDto,
    examples: {
      default: { summary: 'Set quantity', value: { quantity: 2 } },
    },
  })
  async updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: authRequest.AuthRequest,
  ) {
    const userId = this.getAuthUserId(req);

    const sessionId = this.resolveSessionId(req, userId);

    if (!userId && sessionId) {
      req.res?.setHeader('x-session-id', sessionId);
    }

    return this.cartService.updateItem(id, dto, userId, sessionId);
  }

  @Delete('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item UUID' })
  @ApiOkResponse({ description: 'Updated cart after removal' })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  async removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: authRequest.AuthRequest,
  ) {
    const userId = this.getAuthUserId(req);

    const sessionId = this.resolveSessionId(req, userId);

    if (!userId && sessionId) {
      req.res?.setHeader('x-session-id', sessionId);
    }

    return this.cartService.removeItem(id, userId, sessionId);
  }
}
