import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CategoriesQueryDto,
  CategoryProductsQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // findAll — paginated list

  async findAll(query: CategoriesQueryDto) {
    const {
      page = 1,
      limit = 20,
      rootOnly = false,
      withCounts = false,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(rootOnly ? { parentId: null } : {}),
    };

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          parent: {
            select: { id: true, name: true, slug: true },
          },
          _count: withCounts
            ? { select: { children: true, products: true } }
            : undefined,
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    };
  }

  // ─── findTree — full nested tree (all categories with children) ──────────────

  async findTree() {
    // Fetch all categories in one query, then build the tree in JS.
    // More efficient than recursive DB queries for typical category counts.
    const all = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    // Build a map and then attach children
    type CategoryNode = (typeof all)[0] & { children: CategoryNode[] };
    const map = new Map<string, CategoryNode>();

    all.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    const roots: CategoryNode[] = [];

    map.forEach((cat) => {
      if (cat.parentId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children.push(cat);
        }
      } else {
        roots.push(cat);
      }
    });

    return roots;
  }

  // ─── findBySlug ──────────────────────────────────────────────────────────────

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          select: { id: true, name: true, slug: true, description: true },
          orderBy: { name: 'asc' },
        },
        _count: { select: { products: true, children: true } },
      },
    });
  }

  // ─── findById ────────────────────────────────────────────────────────────────

  async findById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  // ─── findProductsBySlug — paginated products under a category ────────────────

  async findProductsBySlug(slug: string, query: CategoryProductsQueryDto) {
    const { page = 1, limit = 20, includeSubcategories = false } = query;
    const skip = (page - 1) * limit;

    // First resolve the category
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { select: { id: true } },
      },
    });

    if (!category) return null;

    type CategoryWithChildren = Category & {
      children: Category[];
    };

    // If includeSubcategories is true, collect all descendant IDs
    let categoryIds = [category.id];

    const categoryTyped = category as CategoryWithChildren;

    if (includeSubcategories && categoryTyped.children?.length > 0) {
      categoryIds = [
        categoryTyped.id,
        ...categoryTyped.children.map((c) => c.id),
      ];
    }

    const where: Prisma.ProductWhereInput = {
      categoryId: { in: categoryIds },
      isActive: true,
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: {
            where: { stockQuantity: { gt: 0 } },
            select: {
              id: true,
              size: true,
              color: true,
              priceOverride: true,
              stockQuantity: true,
              images: true,
            },
            take: 6,
          },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        description: category.description ?? '',
      },
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    };
  }

  // ─── create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateCategoryDto & { slug: string }) {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          parentId: dto.parentId ?? null,
        },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch (error: any) {
      // Prisma unique constraint violation code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2002') {
        throw new InternalServerErrorException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Unique constraint failed on: ${error.meta?.target}`,
        );
      }
      throw error;
    }
  }

  // ─── update ──────────────────────────────────────────────────────────────────

  async update(
    id: string,
    data: Partial<UpdateCategoryDto> & { slug?: string; images?: string[] },
  ) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        // Allow setting parentId to null (promote to root)
        ...('parentId' in data && { parentId: data.parentId ?? null }),
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
  }

  // ─── delete ──────────────────────────────────────────────────────────────────

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  // ─── slugExists ──────────────────────────────────────────────────────────────

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const found = await this.prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    return !!found;
  }

  // ─── hasProducts ─────────────────────────────────────────────────────────────

  async hasProducts(id: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { categoryId: id },
    });
    return count > 0;
  }

  // ─── hasChildren ─────────────────────────────────────────────────────────────

  async hasChildren(id: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { parentId: id },
    });
    return count > 0;
  }
}
