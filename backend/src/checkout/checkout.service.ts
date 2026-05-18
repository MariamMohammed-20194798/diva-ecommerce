/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CartRepository } from '../cart/cart.repository';
import { CreatePaymentIntentDto } from './dto/checkout.dto';
import Stripe from 'stripe';

@Injectable()
export class CheckoutService {
  private readonly stripe: any;
  private readonly logger = new Logger(CheckoutService.name);
  private readonly freeShippingThreshold = 10000;
  private readonly standardShippingAmount = 80;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartRepo: CartRepository,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  // ─── POST /checkout/intent ────────────────────────────────────────────────────
  // 1. Load the user's cart and verify it is not empty
  // 2. Validate all variants still have enough stock
  // 3. Recalculate total on the server — NEVER trust frontend totals
  // 4. Apply discount code if provided
  // 5. Create a Stripe PaymentIntent and return the client_secret

  async createPaymentIntent(
    userId: string,
    dto: CreatePaymentIntentDto,
    autoCreateOrderForTesting = false,
  ) {
    type CartWithItems = Prisma.CartGetPayload<{ include: { items: true } }>;
    type CartItem = CartWithItems['items'][number];

    // Step 1 — Load cart
    const cart = (await this.cartRepo.findOrCreate(userId)) as CartWithItems;
    const items: CartItem[] = cart.items;

    if (!items || items.length === 0) {
      throw new BadRequestException('Your cart is empty.');
    }

    // Step 2 — Verify address belongs to the user
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Shipping address not found.');
    }

    // Step 3 — Load variants with fresh prices and stock
    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: { select: { basePrice: true, isActive: true, name: true } },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v] as const));

    // Validate stock for every item
    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant)
        throw new BadRequestException(
          `A product in your cart is no longer available.`,
        );
      if (!variant.product.isActive)
        throw new BadRequestException(
          `"${variant.product.name}" is no longer available.`,
        );
      if (variant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Only ${variant.stockQuantity} unit(s) of "${variant.product.name}" are left in stock.`,
        );
      }
    }

    // Step 4 — Calculate total (all amounts in cents)
    let subtotalCents = 0;
    for (const item of items) {
      const variant = variantMap.get(item.variantId)!;
      const unitPrice = Number(
        variant.priceOverride ?? variant.product.basePrice,
      );
      subtotalCents += Math.round(unitPrice * 100) * item.quantity;
    }

    let discountCents = 0;
    let discountCodeRecord: {
      id: string;
      type: 'percent' | 'fixed';
      value: any;
    } | null = null;

    if (dto.discountCode) {
      discountCodeRecord = await this.prisma.discountCode.findFirst({
        where: {
          code: dto.discountCode,
          expiresAt: { gt: new Date() },
        },
      });

      if (!discountCodeRecord) {
        throw new BadRequestException(
          'Discount code is invalid or has expired.',
        );
      }

      const fullRecord = await this.prisma.discountCode.findUnique({
        where: { id: discountCodeRecord.id },
        select: { maxUses: true, usedCount: true },
      });

      if (
        fullRecord?.maxUses !== null &&
        fullRecord?.maxUses !== undefined &&
        fullRecord.usedCount >= fullRecord.maxUses
      ) {
        throw new BadRequestException(
          'This discount code has reached its usage limit.',
        );
      }

      if (discountCodeRecord.type === 'percent') {
        discountCents = Math.round(
          subtotalCents * (Number(discountCodeRecord.value) / 100),
        );
      } else {
        discountCents = Math.round(Number(discountCodeRecord.value) * 100);
      }
    }

    const shippingCents =
      subtotalCents >= this.freeShippingThreshold * 100
        ? 0
        : this.standardShippingAmount * 100;
    const totalCents = Math.max(
      subtotalCents + shippingCents - discountCents,
      50,
    );

    // Step 5 — Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'egp',
      metadata: {
        userId,
        cartId: cart.id,
        addressId: dto.addressId,
        discountCodeId: discountCodeRecord?.id ?? '',
        subtotalCents: String(subtotalCents),
        shippingCents: String(shippingCents),
        discountCents: String(discountCents),
      },
      automatic_payment_methods: { enabled: true },
    });

    if (autoCreateOrderForTesting) {
      await this.createOrderFromIntent(paymentIntent);
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subtotal: subtotalCents / 100,
      shipping: shippingCents / 100,
      discount: discountCents / 100,
      total: totalCents / 100,
      currency: 'egp',
    };
  }

  async confirmPayment(userId: string, paymentIntentId: string) {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      throw new NotFoundException('Payment intent was not found.');
    }

    if (paymentIntent.metadata?.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to confirm this payment.',
      );
    }

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(
        `Payment is not complete. Current status: ${paymentIntent.status}.`,
      );
    }

    const order = await this.createOrderFromIntent(paymentIntent);

    return {
      success: true,
      status: paymentIntent.status,
      orderId: order?.id,
    };
  }

  // ─── POST /checkout/webhook ───────────────────────────────────────────────────
  // Called by Stripe. Signature is verified first.
  // On payment_intent.succeeded → create order atomically.

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')!;

    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      await this.createOrderFromIntent(intent);
    }

    return { received: true };
  }

  // ─── Private: atomic order creation ──────────────────────────────────────────

  private async createOrderFromIntent(intent: any) {
    const {
      userId,
      cartId,
      addressId,
      discountCodeId = '',
      discountCents = '0',
    } = intent.metadata ?? {};

    if (!userId || !cartId || !addressId) {
      this.logger.error(
        `Missing required metadata on PaymentIntent ${intent.id}.`,
      );
      return;
    }

    // Idempotency check — don't create duplicate orders for the same PaymentIntent
    const existing = await this.prisma.order.findFirst({
      where: { stripePaymentId: intent.id },
    });

    if (existing) {
      this.logger.warn(
        `Order already exists for PaymentIntent ${intent.id}. Skipping.`,
      );
      return existing;
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          type CartWithItemsAndProduct = Prisma.CartGetPayload<{
            include: {
              items: { include: { variant: { include: { product: true } } } };
            };
          }>;
          type CartItem = CartWithItemsAndProduct['items'][number];

          // Load cart INSIDE transaction to maintain transaction context
          const cart = (await tx.cart.findUnique({
            where: { id: cartId },
            include: {
              items: { include: { variant: { include: { product: true } } } },
            },
          })) as CartWithItemsAndProduct | null;

          if (!cart || !cart.items.length) {
            this.logger.error(
              `Cart ${cartId} is empty or not found. Cannot create order.`,
            );
            return;
          }

          // 1 — Create the order
          const order = await tx.order.create({
            data: {
              userId,
              addressId,
              status: 'PAID',
              totalAmount: intent.amount / 100,
              stripePaymentId: intent.id,
              items: {
                create: cart.items.map((item: CartItem) => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                  unitPrice: Number(
                    item.variant.priceOverride ??
                      item.variant.product.basePrice,
                  ),
                  customization: item.customization ?? undefined,
                })),
              },
            },
          });

          // 2 — Create payment record
          await tx.payment.create({
            data: {
              orderId: order.id,
              stripePaymentId: intent.id,
              stripeChargeId: intent.latest_charge ?? null,
              status: 'SUCCEEDED',
              amount: intent.amount / 100,
              currency: intent.currency,
              metadata: intent.metadata,
              paidAt: new Date(),
            },
          });

          // 3 — Decrement stock for each variant
          for (const item of cart.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }

          // 4 — Apply discount code usage + record it on the order
          if (discountCodeId) {
            await tx.discountCode.update({
              where: { id: discountCodeId },
              data: { usedCount: { increment: 1 } },
            });

            const appliedAmount = Math.max(Number(discountCents) / 100, 0);
            if (appliedAmount > 0) {
              await tx.orderDiscount.create({
                data: {
                  orderId: order.id,
                  discountId: discountCodeId,
                  appliedAmount,
                },
              });
            }
          }

          // 5 — Clear the cart
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

          this.logger.log(
            `Order ${order.id} created from PaymentIntent ${intent.id}`,
          );

          return order;
        },
        { timeout: 10000 }, // 10 second timeout to prevent premature closure
      );
    } catch (err: any) {
      this.logger.error(`Failed to create order: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Order creation failed.');
    }
  }
}
