import { PrismaService } from '../database/prisma.service';
export declare class ReviewRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMyReviews(userId: string): Promise<({
        user: {
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    })[]>;
    findById(id: string): Promise<({
        user: {
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    }) | null>;
    productExists(productId: string): Promise<{
        id: string;
    } | null>;
    hasPurchasedProduct(userId: string, productId: string): Promise<boolean>;
    findUserReviewForProduct(userId: string, productId: string): Promise<{
        id: string;
    } | null>;
    create(data: {
        userId: string;
        productId: string;
        rating: number;
        body?: string;
    }): Promise<{
        user: {
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    }>;
    update(id: string, data: Partial<{
        rating: number;
        body: string | null;
    }>): Promise<{
        user: {
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    }>;
}
