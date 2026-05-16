import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
export declare class CartRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOrCreate(userId?: string, sessionId?: string): Promise<{
        items: ({
            variant: {
                product: {
                    name: string;
                    id: string;
                    images: string[];
                    slug: string;
                    basePrice: Prisma.Decimal;
                };
            } & {
                id: string;
                size: string | null;
                color: string | null;
                sku: string;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
                productId: string;
            };
        } & {
            id: string;
            cartId: string;
            variantId: string;
            quantity: number;
            customization: Prisma.JsonValue | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date | null;
        userId: string | null;
        sessionId: string | null;
    }>;
    findById(cartId: string): Promise<({
        items: ({
            variant: {
                product: {
                    name: string;
                    id: string;
                    images: string[];
                    slug: string;
                    basePrice: Prisma.Decimal;
                };
            } & {
                id: string;
                size: string | null;
                color: string | null;
                sku: string;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
                productId: string;
            };
        } & {
            id: string;
            cartId: string;
            variantId: string;
            quantity: number;
            customization: Prisma.JsonValue | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date | null;
        userId: string | null;
        sessionId: string | null;
    }) | null>;
    addItem(cartId: string, variantId: string, quantity: number, customization?: Record<string, unknown>): Promise<{
        variant: {
            product: {
                name: string;
                id: string;
                images: string[];
                slug: string;
                basePrice: Prisma.Decimal;
            };
        } & {
            id: string;
            size: string | null;
            color: string | null;
            sku: string;
            priceOverride: Prisma.Decimal | null;
            stockQuantity: number;
            images: string[];
            productId: string;
        };
    } & {
        id: string;
        cartId: string;
        variantId: string;
        quantity: number;
        customization: Prisma.JsonValue | null;
    }>;
    updateItem(itemId: string, quantity: number): Promise<{
        variant: {
            product: {
                name: string;
                id: string;
                images: string[];
                slug: string;
                basePrice: Prisma.Decimal;
            };
        } & {
            id: string;
            size: string | null;
            color: string | null;
            sku: string;
            priceOverride: Prisma.Decimal | null;
            stockQuantity: number;
            images: string[];
            productId: string;
        };
    } & {
        id: string;
        cartId: string;
        variantId: string;
        quantity: number;
        customization: Prisma.JsonValue | null;
    }>;
    removeItem(itemId: string): Promise<{
        id: string;
        cartId: string;
        variantId: string;
        quantity: number;
        customization: Prisma.JsonValue | null;
    }>;
    findItemById(itemId: string): Promise<{
        id: string;
        cartId: string;
        variantId: string;
        quantity: number;
        customization: Prisma.JsonValue | null;
    } | null>;
    clearCart(cartId: string): Promise<Prisma.BatchPayload>;
    mergeCarts(guestSessionId: string, userId: string): Promise<void>;
}
