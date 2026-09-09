import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { PrismaService } from '../database/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ─── GET /cart ────────────────────────────────────────────────────────────────

  async getCart(userId?: string, sessionId?: string) {
    const cart = await this.cartRepo.findOrCreate(userId, sessionId);
    return this.formatCart(cart);
  }

  // ─── POST /cart/items ─────────────────────────────────────────────────────────

  async addItem(dto: AddCartItemDto, userId?: string, sessionId?: string) {
    // Verify variant exists and has enough stock
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      select: {
        id: true,
        stockQuantity: true,
        priceOverride: true,
        product: { select: { isActive: true, name: true } },
      },
    });

    if (!variant) {
      throw new NotFoundException(
        `Variant with ID "${dto.variantId}" was not found.`,
      );
    }

    if (!variant.product.isActive) {
      throw new BadRequestException(`This product is no longer available.`);
    }

    if (variant.stockQuantity < dto.quantity) {
      throw new BadRequestException(
        `Only ${variant.stockQuantity} unit(s) available in stock.`,
      );
    }

    const cart = await this.cartRepo.findOrCreate(userId, sessionId);
    const item = await this.cartRepo.addItem(
      cart.id,
      dto.variantId,
      dto.quantity,
      dto.customization,
    );

    return item;
  }

  // ─── PATCH /cart/items/:id ────────────────────────────────────────────────────

  async updateItem(
    itemId: string,
    dto: UpdateCartItemDto,
    userId?: string,
    sessionId?: string,
  ) {
    const item = await this.cartRepo.findItemById(itemId);

    if (!item) {
      throw new NotFoundException(`Cart item "${itemId}" was not found.`);
    }

    // Verify the item belongs to the caller's cart
    await this.assertItemOwnership(item.cartId, userId, sessionId);

    // Quantity of 0 means remove
    if (dto.quantity === 0) {
      await this.cartRepo.removeItem(itemId);
      return { message: 'Item removed from cart.' };
    }

    // Check stock
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: item.variantId },
      select: { stockQuantity: true },
    });

    if (variant && variant.stockQuantity < dto.quantity) {
      throw new BadRequestException(
        `Only ${variant.stockQuantity} unit(s) available in stock.`,
      );
    }

    return this.cartRepo.updateItem(itemId, dto.quantity);
  }

  // ─── DELETE /cart/items/:id ───────────────────────────────────────────────────

  async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const item = await this.cartRepo.findItemById(itemId);

    if (!item) {
      throw new NotFoundException(`Cart item "${itemId}" was not found.`);
    }

    await this.assertItemOwnership(item.cartId, userId, sessionId);
    await this.cartRepo.removeItem(itemId);

    return { message: 'Item removed from cart.' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async assertItemOwnership(
    cartId: string,
    userId?: string,
    sessionId?: string,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      select: { userId: true, sessionId: true },
    });

    if (!cart) throw new NotFoundException('Cart not found.');

    const isOwner =
      (userId && cart.userId === userId) ||
      (sessionId && cart.sessionId === sessionId);

    if (!isOwner) {
      throw new ForbiddenException('You do not own this cart item.');
    }
  }

  // Compute totals and format the response
  private formatCart(
    cart: {
      items?: Array<{
        quantity: number;
        variant?: {
          priceOverride?: unknown;
          product?: { basePrice?: unknown } & Record<string, unknown>;
        };
      }>;
    } & Record<string, unknown>,
  ) {
    const toNumber = (value: unknown) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      // Prisma Decimal serializes as string in some cases
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const subtotal = (cart.items ?? []).reduce((sum: number, item) => {
      const unitPrice = toNumber(
        item.variant?.priceOverride ?? item.variant?.product?.basePrice ?? 0,
      );
      const qty = toNumber(item.quantity);
      return sum + unitPrice * qty;
    }, 0);

    return {
      ...cart,
      subtotal,
      itemCount: (cart.items ?? []).reduce(
        (sum: number, item) => sum + item.quantity,
        0,
      ),
    };
  }
}
