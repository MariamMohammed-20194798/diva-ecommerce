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
} from '@nestjs/swagger';

import { randomUUID } from 'crypto';

import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

import * as authRequest from '../common/types/auth-request';

@ApiTags('cart')
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current cart',
  })
  @ApiOkResponse({
    description: 'Cart with items, subtotal, and itemCount',
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
