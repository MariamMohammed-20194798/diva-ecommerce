import { WishlistRepository } from './wishlist.repository';
import { PrismaService } from '../database/prisma.service';
export declare class WishlistService {
    private readonly wishlistRepository;
    private readonly prisma;
    constructor(wishlistRepository: WishlistRepository, prisma: PrismaService);
    getWishlist(userId: string): Promise<({
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
    addToWishlist(userId: string, variantId: string, image?: string): Promise<{
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
    removeFromWishlist(userId: string, variantId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    checkWishlistStatus(userId: string, variantId: string): Promise<{
        isWishlisted: boolean;
    }>;
}
