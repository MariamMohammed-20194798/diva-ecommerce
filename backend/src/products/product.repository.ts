import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import {
  ProductsQueryDto,
  SearchQueryDto,
  ReviewsQueryDto,
  CreateProductDto,
  UpdateProductDto,
  SortField,
} from './product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ───────

  private buildOrderBy(
    sort: SortField = SortField.NEWEST,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case SortField.PRICE_ASC:
        return { basePrice: 'asc' };
      case SortField.PRICE_DESC:
        return { basePrice: 'desc' };
      case SortField.NEWEST:
        return { createdAt: 'desc' };
      case SortField.RATING:
        return { reviews: { _count: 'desc' } };
      case SortField.POPULAR:
        return { variants: { _count: 'desc' } };
      default:
        return { createdAt: 'desc' };
    }
  }

  private buildVariantFilter(
    size?: string,
    color?: string,
  ): Prisma.ProductVariantListRelationFilter | undefined {
    if (!size && !color) return undefined;
    return {
      some: {
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
        stockQuantity: { gt: 0 },
      },
    };
  }

  // ─── findMany — paginated list with filters ───────

  async findMany(query: ProductsQueryDto) {
    const {
      page = 1,
      limit = 20,
      category,
      size,
      color,
      priceMin,
      priceMax,
      sort,
      isActive = true,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive,
      ...(category && {
        category: { OR: [{ slug: category }, { id: category }] },
      }),
      ...(priceMin !== undefined || priceMax !== undefined
        ? {
            basePrice: {
              ...(priceMin !== undefined ? { gte: priceMin } : {}),
              ...(priceMax !== undefined ? { lte: priceMax } : {}),
            },
          }
        : {}),
      ...(size || color
        ? { variants: this.buildVariantFilter(size, color) }
        : {}),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(sort),
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            where: { stockQuantity: { gt: 0 } },
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              priceOverride: true,
              stockQuantity: true,
              images: true,
            },
            take: 10,
          },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Convert Decimal prices to numbers
    const productsWithNumberPrices = products.map((product) => ({
      ...product,
      basePrice: Number(product.basePrice),
      variants: product.variants.map((variant) => ({
        ...variant,
        priceOverride: variant.priceOverride
          ? Number(variant.priceOverride)
          : null,
      })),
    }));

    return {
      data: productsWithNumberPrices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    };
  }

  // ─── findBySlug — full product detail ──────

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            priceOverride: true,
            stockQuantity: true,
            images: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return null;
    }

    // Convert Decimal prices to numbers
    return {
      ...product,
      basePrice: Number(product.basePrice),
      variants: product.variants.map((variant) => ({
        ...variant,
        priceOverride: variant.priceOverride
          ? Number(variant.priceOverride)
          : null,
      })),
    };
  }

  // ─── findById ──────

  async findById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  // ─── search — PostgreSQL full-text search via pg_trgm ───────

  async search(query: SearchQueryDto) {
    const { q, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Raw SQL using pg_trgm similarity search + ts_rank full-text ranking.
    // Requires: CREATE EXTENSION pg_trgm; CREATE EXTENSION unaccent;
    // And a GIN index:
    //   CREATE INDEX idx_products_search ON products
    //   USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
    const results = await this.prisma.$queryRaw<
      Array<{ id: string; rank: number }>
    >`
      SELECT
        id,
        ts_rank(
          to_tsvector('english', name || ' ' || COALESCE(description, '')),
          plainto_tsquery('english', ${q})
        ) AS rank
      FROM products
      WHERE
        "isActive" = true
        AND (
          to_tsvector('english', name || ' ' || COALESCE(description, ''))
            @@ plainto_tsquery('english', ${q})
          OR similarity(name, ${q}) > 0.2
        )
      ORDER BY rank DESC, similarity(name, ${q}) DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    if (!results.length) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 0, hasNextPage: false },
      };
    }

    const ids = results.map((r) => r.id);

    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          take: 5,
          select: {
            id: true,
            size: true,
            color: true,
            priceOverride: true,
            stockQuantity: true,
            images: true,
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    // Re-sort by the rank order from PostgreSQL and convert Decimal prices to numbers
    const ranked = ids
      .map((id) => {
        const product = products.find((p) => p.id === id);
        if (!product) return null;
        return {
          ...product,
          basePrice: Number(product.basePrice),
          variants: product.variants.map((variant) => ({
            ...variant,
            priceOverride: variant.priceOverride
              ? Number(variant.priceOverride)
              : null,
          })),
        };
      })
      .filter(Boolean);

    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) FROM products
      WHERE "isActive" = true AND (
        to_tsvector('english', name || ' ' || COALESCE(description, ''))
          @@ plainto_tsquery('english', ${q})
        OR similarity(name, ${q}) > 0.2
      )
    `;
    const total = Number(countResult[0].count);

    return {
      data: ranked,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    };
  }

  // ─── findReviews — paginated reviews for a product ───────

  async findReviews(productId: string, query: ReviewsQueryDto) {
    const { page = 1, limit = 10, rating } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      productId,
      ...(rating ? { rating } : {}),
    };

    const [reviews, total, aggregate] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true } },
        },
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        averageRating: aggregate._avg.rating
          ? Number(aggregate._avg.rating.toFixed(1))
          : null,
        totalReviews: aggregate._count.rating,
      },
    };
  }

  // ─── create ────

  async create(dto: CreateProductDto) {
    const slug =
      dto.slug ??
      dto.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        categoryId: dto.categoryId,
        description: dto.description,
        basePrice: dto.basePrice,
        images: dto.images,
        isActive: dto.isActive ?? true,
        metadata:
          dto.metadata !== undefined
            ? (dto.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        variants: dto.variants ? { create: dto.variants } : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
    });

    // Convert Decimal prices to numbers
    return {
      ...product,
      basePrice: Number(product.basePrice),
      variants: product.variants.map((variant) => ({
        ...variant,
        priceOverride: variant.priceOverride
          ? Number(variant.priceOverride)
          : null,
      })),
    };
  }

  // ─── update ────

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.metadata !== undefined && {
          metadata: dto.metadata as Prisma.InputJsonValue,
        }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
    });

    // Convert Decimal prices to numbers
    return {
      ...product,
      basePrice: Number(product.basePrice),
      variants: product.variants.map((variant) => ({
        ...variant,
        priceOverride: variant.priceOverride
          ? Number(variant.priceOverride)
          : null,
      })),
    };
  }

  // ─── slugExists ───

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const product = await this.prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    return !!product;
  }
}
