import { CartRepository } from './cart.repository';
import { PrismaService } from '../database/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartService {
    private readonly cartRepo;
    private readonly prisma;
    constructor(cartRepo: CartRepository, prisma: PrismaService);
    getCart(userId?: string, sessionId?: string): Promise<{
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
    addItem(dto: AddCartItemDto, userId?: string, sessionId?: string): Promise<{
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
    updateItem(itemId: string, dto: UpdateCartItemDto, userId?: string, sessionId?: string): Promise<({
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
    removeItem(itemId: string, userId?: string, sessionId?: string): Promise<{
        message: string;
    }>;
    private assertItemOwnership;
    private formatCart;
}
