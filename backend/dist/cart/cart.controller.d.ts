import express from 'express';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    private getAuthUserId;
    private resolveSessionId;
    getCart(req: express.Request): Promise<{
        subtotal: number;
        itemCount: number;
        items?: Array<{
            quantity: number;
            variant?: {
                priceOverride?: unknown;
                product?: {
                    basePrice?: unknown;
                } & Record<string, unknown>;
            };
        }>;
    }>;
    addItem(dto: AddCartItemDto, req: express.Request): Promise<{
        variant: {
            product: {
                name: string;
                id: string;
                images: string[];
                slug: string;
                basePrice: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            size: string | null;
            color: string | null;
            sku: string;
            priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            stockQuantity: number;
            images: string[];
            productId: string;
        };
    } & {
        id: string;
        cartId: string;
        variantId: string;
        quantity: number;
        customization: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateItem(id: string, dto: UpdateCartItemDto, req: express.Request): Promise<({
        variant: {
            product: {
                name: string;
                id: string;
                images: string[];
                slug: string;
                basePrice: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            size: string | null;
            color: string | null;
            sku: string;
            priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            stockQuantity: number;
            images: string[];
            productId: string;
        };
    } & {
        id: string;
        cartId: string;
        variantId: string;
        quantity: number;
        customization: import("@prisma/client/runtime/library").JsonValue | null;
    }) | {
        message: string;
    }>;
    removeItem(id: string, req: express.Request): Promise<{
        message: string;
    }>;
}
