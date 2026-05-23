import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { OrdersService } from './orders.service';
import {
  OrdersQueryDto,
  UpdateOrderStatusDto,
  OrderStatusEnum,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { AdminGuard } from '../products/guards/admin.guard';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import {
  ApiAdminEndpointErrors,
  ApiProtectedEndpointErrors,
} from '../common/swagger/api-responses';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private getAuthUserId(req: Request) {
    const user = req as unknown as { user?: { sub?: string; id?: string } };
    return user.user?.sub ?? user.user?.id;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /orders
  //
  // Authenticated. Returns the current user's order history, paginated.
  // Optional filter by status (PENDING, PAID, SHIPPED, etc.)
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({
    summary: "Get user's order history",
    description:
      'Returns paginated order history for the authenticated user. ' +
      'Each order includes a summary of items, total, status, and item count. ' +
      'Filter by status to show only active, shipped, or completed orders.',
  })
  @ApiOkResponse({
    description: 'Paginated order list',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440099',
            status: 'PAID',
            total: 5498,
            itemCount: 2,
            createdAt: '2026-05-23T10:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    },
  })
  @ApiProtectedEndpointErrors()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatusEnum })
  async findAll(@Query() query: OrdersQueryDto, @Req() req: Request) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.ordersService.findAll(userId, query);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /orders/:id
  //
  // Authenticated. Returns full detail for a single order.
  // Users can only see their own orders — the repository WHERE clause
  // includes userId to enforce this.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOperation({
    summary: 'Get order detail',
    description:
      'Returns full order detail including all items (with product name, ' +
      'size, color, unit price), shipping address, payment record, and any ' +
      'applied discounts. Users can only access their own orders.',
  })
  @ApiOkResponse({ description: 'Full order detail with items and payment' })
  @ApiNotFoundResponse({
    description: 'Order not found or does not belong to user',
  })
  @ApiProtectedEndpointErrors()
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.ordersService.findOne(id, userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /admin/orders/:id/status
  //
  // Admin only. Updates the order status and optionally sets a tracking number.
  // Enforces valid status transitions (e.g. PAID → PROCESSING → SHIPPED).
  // Triggers a transactional email after each status change.
  // ─────────────────────────────────────────────────────────────────────────────

  @Patch('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOperation({
    summary: 'Update order status (admin)',
    description:
      "Updates an order's status. Enforces valid transitions: " +
      'PENDING → PAID → PROCESSING → SHIPPED → DELIVERED. ' +
      'SHIPPED requires a trackingNumber. ' +
      'An email is sent to the customer after each change. ' +
      'Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Order updated with new status' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({
    description: 'Invalid status transition or missing tracking number',
  })
  @ApiAdminEndpointErrors()
  @ApiBody({
    type: UpdateOrderStatusDto,
    examples: {
      shipped: {
        summary: 'Mark order as shipped',
        value: { status: 'SHIPPED', trackingNumber: 'DHL-123456789' },
      },
    },
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
