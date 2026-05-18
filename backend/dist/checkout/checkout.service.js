"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CheckoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const cart_repository_1 = require("../cart/cart.repository");
const stripe_1 = __importDefault(require("stripe"));
let CheckoutService = CheckoutService_1 = class CheckoutService {
    prisma;
    cartRepo;
    config;
    stripe;
    logger = new common_1.Logger(CheckoutService_1.name);
    freeShippingThreshold = 10000;
    standardShippingAmount = 80;
    constructor(prisma, cartRepo, config) {
        this.prisma = prisma;
        this.cartRepo = cartRepo;
        this.config = config;
        this.stripe = new stripe_1.default(this.config.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2026-03-25.dahlia',
        });
    }
    async createPaymentIntent(userId, dto, autoCreateOrderForTesting = false) {
        const cart = (await this.cartRepo.findOrCreate(userId));
        const items = cart.items;
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('Your cart is empty.');
        }
        const address = await this.prisma.address.findFirst({
            where: { id: dto.addressId, userId },
        });
        if (!address) {
            throw new common_1.NotFoundException('Shipping address not found.');
        }
        const variantIds = items.map((i) => i.variantId);
        const variants = await this.prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: {
                product: { select: { basePrice: true, isActive: true, name: true } },
            },
        });
        const variantMap = new Map(variants.map((v) => [v.id, v]));
        for (const item of items) {
            const variant = variantMap.get(item.variantId);
            if (!variant)
                throw new common_1.BadRequestException(`A product in your cart is no longer available.`);
            if (!variant.product.isActive)
                throw new common_1.BadRequestException(`"${variant.product.name}" is no longer available.`);
            if (variant.stockQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Only ${variant.stockQuantity} unit(s) of "${variant.product.name}" are left in stock.`);
            }
        }
        let subtotalCents = 0;
        for (const item of items) {
            const variant = variantMap.get(item.variantId);
            const unitPrice = Number(variant.priceOverride ?? variant.product.basePrice);
            subtotalCents += Math.round(unitPrice * 100) * item.quantity;
        }
        let discountCents = 0;
        let discountCodeRecord = null;
        if (dto.discountCode) {
            discountCodeRecord = await this.prisma.discountCode.findFirst({
                where: {
                    code: dto.discountCode,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!discountCodeRecord) {
                throw new common_1.BadRequestException('Discount code is invalid or has expired.');
            }
            const fullRecord = await this.prisma.discountCode.findUnique({
                where: { id: discountCodeRecord.id },
                select: { maxUses: true, usedCount: true },
            });
            if (fullRecord?.maxUses !== null &&
                fullRecord?.maxUses !== undefined &&
                fullRecord.usedCount >= fullRecord.maxUses) {
                throw new common_1.BadRequestException('This discount code has reached its usage limit.');
            }
            if (discountCodeRecord.type === 'percent') {
                discountCents = Math.round(subtotalCents * (Number(discountCodeRecord.value) / 100));
            }
            else {
                discountCents = Math.round(Number(discountCodeRecord.value) * 100);
            }
        }
        const shippingCents = subtotalCents >= this.freeShippingThreshold * 100
            ? 0
            : this.standardShippingAmount * 100;
        const totalCents = Math.max(subtotalCents + shippingCents - discountCents, 50);
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
    async confirmPayment(userId, paymentIntentId) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        if (!paymentIntent) {
            throw new common_1.NotFoundException('Payment intent was not found.');
        }
        if (paymentIntent.metadata?.userId !== userId) {
            throw new common_1.ForbiddenException('You are not allowed to confirm this payment.');
        }
        if (paymentIntent.status !== 'succeeded') {
            throw new common_1.BadRequestException(`Payment is not complete. Current status: ${paymentIntent.status}.`);
        }
        const order = await this.createOrderFromIntent(paymentIntent);
        return {
            success: true,
            status: paymentIntent.status,
            orderId: order?.id,
        };
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'payment_intent.succeeded') {
            const intent = event.data.object;
            await this.createOrderFromIntent(intent);
        }
        return { received: true };
    }
    async createOrderFromIntent(intent) {
        const { userId, cartId, addressId, discountCodeId = '', discountCents = '0', } = intent.metadata ?? {};
        if (!userId || !cartId || !addressId) {
            this.logger.error(`Missing required metadata on PaymentIntent ${intent.id}.`);
            return;
        }
        const existing = await this.prisma.order.findFirst({
            where: { stripePaymentId: intent.id },
        });
        if (existing) {
            this.logger.warn(`Order already exists for PaymentIntent ${intent.id}. Skipping.`);
            return existing;
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const cart = (await tx.cart.findUnique({
                    where: { id: cartId },
                    include: {
                        items: { include: { variant: { include: { product: true } } } },
                    },
                }));
                if (!cart || !cart.items.length) {
                    this.logger.error(`Cart ${cartId} is empty or not found. Cannot create order.`);
                    return;
                }
                const order = await tx.order.create({
                    data: {
                        userId,
                        addressId,
                        status: 'PAID',
                        totalAmount: intent.amount / 100,
                        stripePaymentId: intent.id,
                        items: {
                            create: cart.items.map((item) => ({
                                variantId: item.variantId,
                                quantity: item.quantity,
                                unitPrice: Number(item.variant.priceOverride ??
                                    item.variant.product.basePrice),
                                customization: item.customization ?? undefined,
                            })),
                        },
                    },
                });
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
                for (const item of cart.items) {
                    await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: { stockQuantity: { decrement: item.quantity } },
                    });
                }
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
                await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
                this.logger.log(`Order ${order.id} created from PaymentIntent ${intent.id}`);
                return order;
            }, { timeout: 10000 });
        }
        catch (err) {
            this.logger.error(`Failed to create order: ${err.message}`, err.stack);
            throw new common_1.InternalServerErrorException('Order creation failed.');
        }
    }
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = CheckoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cart_repository_1.CartRepository,
        config_1.ConfigService])
], CheckoutService);
//# sourceMappingURL=checkout.service.js.map