import express from 'express';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/wishlist.dto';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    private getUserId;
    getWishlist(req: express.Request): Promise<({
        variant: {
            product: {
                id: string;
                slug: string;
                name: string;
                images: string[];
                basePrice: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            images: string[];
            productId: string;
            sku: string;
            size: string | null;
            color: string | null;
            priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            stockQuantity: number;
        };
    } & {
        id: string;
        userId: string;
        variantId: string;
        image: string | null;
        createdAt: Date;
    })[]>;
    addToWishlist(dto: AddToWishlistDto, req: express.Request): Promise<{
        variant: {
            product: {
                id: string;
                slug: string;
                name: string;
                images: string[];
                basePrice: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            images: string[];
            productId: string;
            sku: string;
            size: string | null;
            color: string | null;
            priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            stockQuantity: number;
        };
    } & {
        id: string;
        userId: string;
        variantId: string;
        image: string | null;
        createdAt: Date;
    }>;
    removeFromWishlist(variantId: string, req: express.Request): Promise<import("@prisma/client").Prisma.BatchPayload>;
    checkStatus(variantId: string, req: express.Request): Promise<{
        isWishlisted: boolean;
    }>;
}
