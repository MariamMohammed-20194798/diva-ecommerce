import { CategoriesService } from './categories.service';
import { CategoriesQueryDto, CategoryProductsQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
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
    findOne(slug: string): Promise<{
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
    }>;
    findProducts(slug: string, query: CategoryProductsQueryDto): Promise<{
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
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
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
            basePrice: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    }>;
    create(dto: CreateCategoryDto): Promise<{
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
    update(id: string, dto: UpdateCategoryDto): Promise<{
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
        message: string;
    }>;
}
