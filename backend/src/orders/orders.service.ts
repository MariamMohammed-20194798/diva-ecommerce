/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { OrdersRepository } from './order.repository';
import {
  OrdersQueryDto,
  UpdateOrderStatusDto,
  OrderStatusEnum,
} from './order.dto';

// Valid status transitions — prevents nonsensical moves like DELIVERED → PENDING
const ALLOWED_TRANSITIONS: Record<OrderStatusEnum, OrderStatusEnum[]> = {
  [OrderStatusEnum.PENDING]: [OrderStatusEnum.PAID, OrderStatusEnum.CANCELLED],
  [OrderStatusEnum.PAID]: [
    OrderStatusEnum.PROCESSING,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.PROCESSING]: [
    OrderStatusEnum.SHIPPED,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED],
  [OrderStatusEnum.DELIVERED]: [],
  [OrderStatusEnum.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepo: OrdersRepository,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  // GET /orders

  async findAll(userId: string, query: OrdersQueryDto) {
    return this.ordersRepo.findMany(userId, query);
  }

  // GET /orders/:id

  async findOne(orderId: string, userId: string) {
    const order = await this.ordersRepo.findOne(orderId, userId);

    if (!order) {
      throw new NotFoundException(
        `Order "${orderId}" was not found or does not belong to your account.`,
      );
    }

    return order;
  }

  // PATCH /admin/orders/:id/status

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.ordersRepo.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order "${orderId}" was not found.`);
    }

    const currentStatus = order.status as OrderStatusEnum;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition order from "${currentStatus}" to "${dto.status}". ` +
          `Allowed transitions: ${allowed.length ? allowed.join(', ') : 'none'}.`,
      );
    }

    // SHIPPED status requires a tracking number
    if (dto.status === OrderStatusEnum.SHIPPED && !dto.trackingNumber) {
      throw new BadRequestException(
        'A tracking number is required when marking an order as SHIPPED.',
      );
    }

    const updated = await this.ordersRepo.updateStatus(
      orderId,
      dto.status,
      dto.trackingNumber,
    );

    // Trigger email notification (fire-and-forget — don't block the response)
    this.sendStatusEmail(updated, dto.trackingNumber).catch((err) =>
      this.logger.error(
        `Failed to send status email for order ${orderId}: ${err.message}`,
      ),
    );

    return updated;
  }

  private async sendStatusEmail(
    order: { id: string; status: string },
    trackingNumber?: string,
  ) {
    const emailMap: Record<OrderStatusEnum, string> = {
      [OrderStatusEnum.PAID]: 'order-confirmation',
      [OrderStatusEnum.PROCESSING]: 'order-processing',
      [OrderStatusEnum.SHIPPED]: 'order-shipped',
      [OrderStatusEnum.DELIVERED]: 'order-delivered',
      [OrderStatusEnum.CANCELLED]: 'order-cancelled',
      [OrderStatusEnum.PENDING]: '',
    };

    const template = emailMap[order.status as OrderStatusEnum];
    if (!template) return;

    await this.emailQueue.add('order-status', {
      template,
      orderId: order.id,
      status: order.status,
      trackingNumber,
    });
  }
}
