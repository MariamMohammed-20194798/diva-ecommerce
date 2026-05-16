import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CategoriesQueryDto, CategoryProductsQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: CategoriesQueryDto): Promise<{
        data: ({
            _count: {
                parent: number;
                children: number;
                products: number;
            };
            parent: {
                name: string;
                id: string;
                slug: string;
            } | null;
        } & {
            name: string;
            id: string;
            description: string | null;
            images: string[];
            slug: string;
            parentId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    }>;
    findTree(): Promise<({
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        description: string | null;
        images: string[];
        slug: string;
        parentId: string | null;
    } & {
        children: ({
            _count: {
                products: number;
            };
        } & {
            name: string;
            id: string;
            description: string | null;
            images: string[];
            slug: string;
            parentId: string | null;
        } & any)[];
    })[]>;
    findBySlug(slug: string): Promise<({
        _count: {
            children: number;
            products: number;
        };
        parent: {
            name: string;
            id: string;
            slug: string;
        } | null;
        children: {
            name: string;
            id: string;
            description: string | null;
            slug: string;
        }[];
    } & {
        name: string;
        id: string;
        description: string | null;
        images: string[];
        slug: string;
        parentId: string | null;
    }) | null>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        images: string[];
        slug: string;
        parentId: string | null;
    } | null>;
    findProductsBySlug(slug: string, query: CategoryProductsQueryDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            description: string;
        };
        data: ({
            _count: {
                reviews: number;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    } | null>;
    create(dto: CreateCategoryDto & {
        slug: string;
    }): Promise<{
        parent: {
            name: string;
            id: string;
            slug: string;
        } | null;
    } & {
        name: string;
        id: string;
        description: string | null;
        images: string[];
        slug: string;
        parentId: string | null;
    }>;
    update(id: string, data: Partial<UpdateCategoryDto> & {
        slug?: string;
        images?: string[];
    }): Promise<{
        _count: {
            products: number;
        };
        parent: {
            name: string;
            id: string;
            slug: string;
        } | null;
        children: {
            name: string;
            id: string;
            slug: string;
        }[];
    } & {
        name: string;
        id: string;
        description: string | null;
        images: string[];
        slug: string;
        parentId: string | null;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        images: string[];
        slug: string;
        parentId: string | null;
    }>;
    slugExists(slug: string, excludeId?: string): Promise<boolean>;
    hasProducts(id: string): Promise<boolean>;
    hasChildren(id: string): Promise<boolean>;
}
