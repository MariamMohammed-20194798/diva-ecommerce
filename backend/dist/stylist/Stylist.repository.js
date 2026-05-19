"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistRepository = exports.CATEGORY_GROUPS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
exports.CATEGORY_GROUPS = {
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
const SEASON_COLORS = {
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
let StylistRepository = class StylistRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async fetchCandidateProducts(dto) {
        const seasonColors = SEASON_COLORS[dto.season] ?? [];
        const colorHints = dto.preferredColor
            ? [dto.preferredColor, ...seasonColors]
            : seasonColors;
        const styleFilter = dto.style
            ? { path: ['style'], string_contains: dto.style }
            : undefined;
        const budgetFilter = dto.budgetCents
            ? { lte: dto.budgetCents / 100 }
            : undefined;
        const [dresses, tops, bottoms, outerwear, shoes, bags, accessories] = await Promise.all([
            this.fetchGroup(exports.CATEGORY_GROUPS.dresses, colorHints, budgetFilter, styleFilter, 10),
            this.fetchGroup(exports.CATEGORY_GROUPS.tops, colorHints, budgetFilter, styleFilter, 6),
            this.fetchGroup(exports.CATEGORY_GROUPS.bottoms, colorHints, budgetFilter, styleFilter, 6),
            this.fetchGroup(exports.CATEGORY_GROUPS.outerwear, colorHints, budgetFilter, styleFilter, 4),
            this.fetchGroup(exports.CATEGORY_GROUPS.shoes, colorHints, budgetFilter, styleFilter, 8),
            this.fetchGroup(exports.CATEGORY_GROUPS.bags, colorHints, budgetFilter, styleFilter, 6),
            this.fetchGroup(exports.CATEGORY_GROUPS.accessories, colorHints, budgetFilter, styleFilter, 8),
        ]);
        return { dresses, tops, bottoms, outerwear, shoes, bags, accessories };
    }
    async fetchGroup(categorySlugs, colorHints, budgetFilter, styleFilter, limit) {
        return this.prisma.product.findMany({
            where: {
                isActive: true,
                category: { slug: { in: categorySlugs } },
                ...(budgetFilter ? { basePrice: budgetFilter } : {}),
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
    async fetchAnchorProduct(productId) {
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
    async fetchComplementaryProducts(anchorCategorySlug, anchorColor, budgetCents) {
        const anchorGroup = Object.entries(exports.CATEGORY_GROUPS).find(([, slugs]) => slugs.includes(anchorCategorySlug))?.[0];
        const excludedSlugs = anchorGroup
            ? exports.CATEGORY_GROUPS[anchorGroup]
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
};
exports.StylistRepository = StylistRepository;
exports.StylistRepository = StylistRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StylistRepository);
//# sourceMappingURL=Stylist.repository.js.map