import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { OrdersQueryDto, OrderStatusEnum } from './order.dto';

// Full order detail include — used for single order queries
const ORDER_DETAIL_INCLUDE = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  },
  address: true,
  payments: {
    select: {
      id: true,
      status: true,
      amount: true,
      currency: true,
      paidAt: true,
      stripePaymentId: true,
    },
  },
  discounts: {
    include: {
      discount: { select: { code: true, type: true, value: true } },
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // findMany — paginated order history for a user

  async findMany(userId: string, query: OrdersQueryDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status ? { status } : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              variant: {
                select: {
                  size: true,
                  color: true,
                  images: true,
                  product: { select: { name: true, slug: true } },
                },
              },
            },
          },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    };
  }

  // findOne — single order with full detail

  async findOne(orderId: string, userId?: string) {
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
        // If userId is provided, ensure the order belongs to that user.
        // Admins call without userId to bypass this check.
        ...(userId ? { userId } : {}),
      },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  // updateStatus — admin update with optional tracking

  async updateStatus(
    orderId: string,
    status: OrderStatusEnum,
    trackingNumber?: string,
  ) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
        updatedAt: new Date(),
      },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  // findById

  async findById(orderId: string) {
    return this.prisma.order.findUnique({ where: { id: orderId } });
  }
}
