import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { GenerateOutfitDto } from './dto/Stylist.dto';

// Category groups used for outfit building
// Adjust these to match your actual category slugs
export const CATEGORY_GROUPS = {
  tops: ['t-shirts', 'tops', 'blouses', 'shirts'],
  bottoms: ['skirts', 'trousers', 'jeans', 'shorts'],
  dresses: ['dresses', 'gowns', 'jumpsuits'],
  outerwear: ['coats', 'jackets', 'blazers'],
  shoes: ['heels', 'flats', 'sneakers', 'boots', 'sandals', 'shoes'],
  bags: ['bags', 'handbags', 'clutches', 'totes'],
  accessories: [
    'accessories',
    'jewellery',
    'earrings',
    'necklaces',
    'belts',
    'scarves',
  ],
};

// Seasonal color palettes used to refine DB filtering
const SEASON_COLORS: Record<string, string[]> = {
  spring: [
    'blush',
    'lavender',
    'mint',
    'white',
    'yellow',
    'light blue',
    'coral',
  ],
  summer: ['white', 'coral', 'yellow', 'turquoise', 'nude', 'red', 'orange'],
  autumn: ['camel', 'brown', 'burgundy', 'orange', 'rust', 'olive', 'mustard'],
  winter: ['black', 'navy', 'grey', 'white', 'deep red', 'emerald', 'plum'],
  all: [],
};

@Injectable()
export class StylistRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Fetch candidate products for outfit generation ───────────────────────
  // Returns up to 40 products from relevant categories filtered by
  // user preferences. The AI then selects the best combination.

  async fetchCandidateProducts(dto: GenerateOutfitDto) {
    const seasonColors = SEASON_COLORS[dto.season] ?? [];
    const colorHints = dto.preferredColor
      ? [dto.preferredColor, ...seasonColors]
      : seasonColors;

    // Build metadata filter for style — stored as product.metadata.style
    const styleFilter: Prisma.JsonFilter = dto.style
      ? { path: ['style'], string_contains: dto.style }
      : undefined;

    // Budget filter: basePrice <= budget (budget is in cents, price stored as decimal)
    const budgetFilter = dto.budgetCents
      ? { lte: dto.budgetCents / 100 }
      : undefined;

    // Fetch from each category group in parallel
    const [dresses, tops, bottoms, outerwear, shoes, bags, accessories] =
      await Promise.all([
        this.fetchGroup(
          CATEGORY_GROUPS.dresses,
          colorHints,
          budgetFilter,
          styleFilter,
          10,
        ),
        this.fetchGroup(
          CATEGORY_GROUPS.tops,
          colorHints,
          budgetFilter,
          styleFilter,
          6,
        ),
        this.fetchGroup(
          CATEGORY_GROUPS.bottoms,
          colorHints,
          budgetFilter,
          styleFilter,
          6,
        ),
        this.fetchGroup(
          CATEGORY_GROUPS.outerwear,
          colorHints,
          budgetFilter,
          styleFilter,
          4,
        ),
        this.fetchGroup(
          CATEGORY_GROUPS.shoes,
          colorHints,
          budgetFilter,
          styleFilter,
          8,
        ),
        this.fetchGroup(
          CATEGORY_GROUPS.bags,
          colorHints,
          budgetFilter,
          styleFilter,
          6,
        ),
        this.fetchGroup(
          CATEGORY_GROUPS.accessories,
          colorHints,
          budgetFilter,
          styleFilter,
          8,
        ),
      ]);

    return { dresses, tops, bottoms, outerwear, shoes, bags, accessories };
  }

  private async fetchGroup(
    categorySlugs: string[],
    colorHints: string[],
    budgetFilter: any,
    styleFilter: any,
    limit: number,
  ) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        category: { slug: { in: categorySlugs } },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...(budgetFilter ? { basePrice: budgetFilter } : {}),
        // Color match: prefer preferred/seasonal colors via OR filter
        ...(colorHints.length > 0
          ? {
              variants: {
                some: {
                  color: {
                    in: colorHints,
                    mode: 'insensitive',
                  },
                  stockQuantity: { gt: 0 },
                },
              },
            }
          : {
              variants: { some: { stockQuantity: { gt: 0 } } },
            }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        variants: {
          where: { stockQuantity: { gt: 0 } },
          select: {
            id: true,
            color: true,
            size: true,
            priceOverride: true,
            images: true,
            stockQuantity: true,
          },
          take: 3,
        },
      },
    });
  }

  // ─── Fetch a single anchor product + related candidates (Complete the Look) ─

  async fetchAnchorProduct(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { name: true, slug: true } },
        variants: {
          where: { stockQuantity: { gt: 0 } },
          select: {
            id: true,
            color: true,
            size: true,
            priceOverride: true,
            images: true,
          },
          take: 3,
        },
      },
    });
  }

  async fetchComplementaryProducts(
    anchorCategorySlug: string,
    anchorColor: string | undefined,
    budgetCents: number | undefined,
  ) {
    // Exclude the anchor's own category group — we only want complementary items
    const anchorGroup = Object.entries(CATEGORY_GROUPS).find(([, slugs]) =>
      slugs.includes(anchorCategorySlug),
    )?.[0];

    const excludedSlugs = anchorGroup
      ? CATEGORY_GROUPS[anchorGroup as keyof typeof CATEGORY_GROUPS]
      : [];

    const budgetFilter = budgetCents ? { lte: budgetCents / 100 } : undefined;

    return this.prisma.product.findMany({
      where: {
        isActive: true,
        category: { slug: { notIn: excludedSlugs } },
        ...(budgetFilter ? { basePrice: budgetFilter } : {}),
        variants: { some: { stockQuantity: { gt: 0 } } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        variants: {
          where: { stockQuantity: { gt: 0 } },
          select: {
            id: true,
            color: true,
            size: true,
            priceOverride: true,
            images: true,
          },
          take: 3,
        },
      },
    });
  }
}
