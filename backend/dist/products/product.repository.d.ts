import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { ProductsQueryDto, SearchQueryDto, ReviewsQueryDto, CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildOrderBy;
    private buildVariantFilter;
    findMany(query: ProductsQueryDto): Promise<{
        data: {
            basePrice: number;
            variants: {
                priceOverride: number | null;
                id: string;
                size: string | null;
                color: string | null;
                sku: string;
                stockQuantity: number;
                images: string[];
            }[];
            category: {
                name: string;
                id: string;
                slug: string;
            };
            _count: {
                reviews: number;
            };
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            images: string[];
            slug: string;
            categoryId: string;
            metadata: Prisma.JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    }>;
    findBySlug(slug: string): Promise<{
        basePrice: number;
        variants: {
            priceOverride: number | null;
            id: string;
            size: string | null;
            color: string | null;
            sku: string;
            stockQuantity: number;
            images: string[];
        }[];
        category: {
            name: string;
            id: string;
            slug: string;
        };
        reviews: ({
            user: {
                email: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            rating: number;
            productId: string;
            body: string | null;
        })[];
        _count: {
            reviews: number;
        };
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        images: string[];
        slug: string;
        categoryId: string;
        metadata: Prisma.JsonValue | null;
    } | null>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        images: string[];
        slug: string;
        categoryId: string;
        basePrice: Prisma.Decimal;
        metadata: Prisma.JsonValue | null;
    } | null>;
    search(query: SearchQueryDto): Promise<{
        data: ({
            basePrice: number;
            variants: {
                priceOverride: number | null;
                id: string;
                size: string | null;
                color: string | null;
                stockQuantity: number;
                images: string[];
            }[];
            category: {
                name: string;
                id: string;
                slug: string;
            };
            _count: {
                reviews: number;
            };
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            images: string[];
            slug: string;
            categoryId: string;
            metadata: Prisma.JsonValue | null;
        } | null)[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    }>;
    findReviews(productId: string, query: ReviewsQueryDto): Promise<{
        data: ({
            user: {
                email: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            rating: number;
            productId: string;
            body: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            averageRating: number | null;
            totalReviews: number;
        };
    }>;
    create(dto: CreateProductDto): Promise<{
        basePrice: number;
        variants: {
            priceOverride: number | null;
            id: string;
            size: string | null;
            color: string | null;
            sku: string;
            stockQuantity: number;
            images: string[];
            productId: string;
        }[];
        category: {
            name: string;
            id: string;
            slug: string;
        };
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        images: string[];
        slug: string;
        categoryId: string;
        metadata: Prisma.JsonValue | null;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        basePrice: number;
        variants: {
            priceOverride: number | null;
            id: string;
            size: string | null;
            color: string | null;
            sku: string;
            stockQuantity: number;
            images: string[];
            productId: string;
        }[];
        category: {
            name: string;
            id: string;
            slug: string;
        };
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        images: string[];
        slug: string;
        categoryId: string;
        metadata: Prisma.JsonValue | null;
    }>;
    slugExists(slug: string, excludeId?: string): Promise<boolean>;
}
