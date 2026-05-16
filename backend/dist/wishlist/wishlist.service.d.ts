import { WishlistRepository } from './wishlist.repository';
import { PrismaService } from '../database/prisma.service';
export declare class WishlistService {
    private readonly wishlistRepository;
    private readonly prisma;
    constructor(wishlistRepository: WishlistRepository, prisma: PrismaService);
    getWishlist(userId: string): Promise<({
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
    addToWishlist(userId: string, variantId: string, image?: string): Promise<{
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
    removeFromWishlist(userId: string, variantId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    checkWishlistStatus(userId: string, variantId: string): Promise<{
        isWishlisted: boolean;
    }>;
}
