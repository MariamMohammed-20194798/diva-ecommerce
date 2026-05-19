import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { GenerateOutfitDto } from './dto/Stylist.dto';
export declare const CATEGORY_GROUPS: {
    tops: string[];
    bottoms: string[];
    dresses: string[];
    outerwear: string[];
    shoes: string[];
    bags: string[];
    accessories: string[];
};
export declare class StylistRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    fetchCandidateProducts(dto: GenerateOutfitDto): Promise<{
        dresses: ({
            category: {
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                size: string | null;
                color: string | null;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
            }[];
        } & {
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
        })[];
        tops: ({
            category: {
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                size: string | null;
                color: string | null;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
            }[];
        } & {
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
        })[];
        bottoms: ({
            category: {
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                size: string | null;
                color: string | null;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
            }[];
        } & {
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
        })[];
        outerwear: ({
            category: {
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                size: string | null;
                color: string | null;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
            }[];
        } & {
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
        })[];
        shoes: ({
            category: {
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                size: string | null;
                color: string | null;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
            }[];
        } & {
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
        })[];
        bags: ({
            category: {
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                size: string | null;
                color: string | null;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
            }[];
        } & {
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
        })[];
        accessories: ({
            category: {
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                size: string | null;
                color: string | null;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
            }[];
        } & {
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
        })[];
    }>;
    private fetchGroup;
    fetchAnchorProduct(productId: string): Promise<({
        category: {
            name: string;
            slug: string;
        };
        variants: {
            id: string;
            size: string | null;
            color: string | null;
            priceOverride: Prisma.Decimal | null;
            images: string[];
        }[];
    } & {
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
    }) | null>;
    fetchComplementaryProducts(anchorCategorySlug: string, anchorColor: string | undefined, budgetCents: number | undefined): Promise<({
        category: {
            name: string;
            slug: string;
        };
        variants: {
            id: string;
            size: string | null;
            color: string | null;
            priceOverride: Prisma.Decimal | null;
            images: string[];
        }[];
    } & {
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
    })[]>;
}
