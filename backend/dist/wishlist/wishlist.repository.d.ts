import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
export declare class WishlistRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUserId(userId: string): Promise<({
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
        createdAt: Date;
        userId: string;
        variantId: string;
        image: string | null;
    })[]>;
    add(userId: string, variantId: string, image?: string): Promise<{
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
        createdAt: Date;
        userId: string;
        variantId: string;
        image: string | null;
    }>;
    remove(userId: string, variantId: string): Promise<Prisma.BatchPayload>;
    exists(userId: string, variantId: string): Promise<boolean>;
}
