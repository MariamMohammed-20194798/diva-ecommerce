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
        createdAt: Date;
        userId: string;
        variantId: string;
        image: string | null;
    })[]>;
    addToWishlist(dto: AddToWishlistDto, req: express.Request): Promise<{
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
        createdAt: Date;
        userId: string;
        variantId: string;
        image: string | null;
    }>;
    removeFromWishlist(variantId: string, req: express.Request): Promise<import("@prisma/client").Prisma.BatchPayload>;
    checkStatus(variantId: string, req: express.Request): Promise<{
        isWishlisted: boolean;
    }>;
}
