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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StylistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const Stylist_repository_1 = require("./Stylist.repository");
let StylistService = StylistService_1 = class StylistService {
    repo;
    config;
    anthropic;
    logger = new common_1.Logger(StylistService_1.name);
    constructor(repo, config) {
        this.repo = repo;
        this.config = config;
        this.anthropic = new sdk_1.default({
            apiKey: this.config.get('ANTHROPIC_API_KEY'),
        });
    }
    async generateOutfit(dto) {
        this.logger.log(`Fetching candidates for ${dto.occasion} / ${dto.style} / ${dto.season}`);
        const candidates = await this.repo.fetchCandidateProducts(dto);
        const totalCount = candidates.dresses.length +
            candidates.tops.length +
            candidates.bottoms.length +
            candidates.outerwear.length +
            candidates.shoes.length +
            candidates.bags.length +
            candidates.accessories.length;
        if (totalCount === 0) {
            throw new common_1.BadRequestException('No matching products found for your preferences. Try broadening your filters.');
        }
        const catalog = this.formatCatalog(candidates);
        const prompt = this.buildOutfitPrompt(dto, catalog);
        this.logger.log(`Calling Claude with ${totalCount} candidate products`);
        const rawResponse = await this.callClaude(prompt);
        const parsed = this.parseAiResponse(rawResponse);
        const allProducts = [
            ...candidates.dresses,
            ...candidates.tops,
            ...candidates.bottoms,
            ...candidates.outerwear,
            ...candidates.shoes,
            ...candidates.bags,
            ...candidates.accessories,
        ];
        const enriched = this.enrichOutfits(parsed.outfits, allProducts);
        return {
            preferences: {
                occasion: dto.occasion,
                season: dto.season,
                style: dto.style,
                preferredColor: dto.preferredColor ?? 'any',
                budgetCents: dto.budgetCents ?? 'no limit',
            },
            outfits: enriched,
            generalAdvice: parsed.generalAdvice,
            productCount: totalCount,
        };
    }
    async completeTheLook(dto) {
        const anchor = await this.repo.fetchAnchorProduct(dto.productId);
        if (!anchor) {
            throw new common_1.NotFoundException(`Product "${dto.productId}" not found.`);
        }
        const anchorColor = anchor.variants[0]?.color ?? undefined;
        const anchorCategorySlug = anchor.category.slug;
        const complementary = await this.repo.fetchComplementaryProducts(anchorCategorySlug, anchorColor, dto.budgetCents);
        if (complementary.length === 0) {
            throw new common_1.BadRequestException('No complementary products found.');
        }
        const anchorText = this.formatProduct(anchor);
        const complementaryCatalog = complementary
            .map((p, i) => this.formatProduct(p, i + 1))
            .join('\n');
        const prompt = `You are a luxury fashion stylist.
The customer has selected this anchor piece:
${anchorText}

Complete the look using ONLY items from this list:
${complementaryCatalog}

${dto.occasion ? `Occasion: ${dto.occasion}` : ''}

Return JSON exactly in this format:
{
  "outfits": [{
    "outfitIndex": 1,
    "title": "string",
    "theme": "string",
    "stylingNotes": "string (2-3 sentences)",
    "items": [
      {
        "productId": "string (must match ID from list above)",
        "variantId": "string",
        "name": "string",
        "category": "string",
        "color": "string",
        "price": number,
        "reason": "string (1 sentence why this piece completes the look)"
      }
    ],
    "totalPrice": number,
    "alternativeTip": "string"
  }],
  "generalAdvice": "string"
}

Rules:
- Include 2-4 complementary items maximum
- The anchor item is already chosen; only pick accessories and shoes
- Only use product IDs from the list above
- totalPrice should include only the complementary items, not the anchor`;
        const raw = await this.callClaude(prompt);
        const parsed = this.parseAiResponse(raw);
        const anchorItem = {
            productId: anchor.id,
            variantId: anchor.variants[0]?.id ?? '',
            name: anchor.name,
            category: anchor.category.name,
            color: anchor.variants[0]?.color ?? 'N/A',
            price: Number(anchor.variants[0]?.priceOverride ?? anchor.basePrice),
            image: anchor.variants[0]?.images?.[0] ?? null,
            reason: 'Your selected anchor piece.',
        };
        const enriched = this.enrichOutfits(parsed.outfits, complementary);
        enriched.forEach((outfit) => {
            outfit.items.unshift(anchorItem);
            outfit.totalPrice += anchorItem.price;
        });
        return {
            preferences: {
                anchorProduct: anchor.name,
                occasion: dto.occasion ?? 'any',
                budgetCents: dto.budgetCents ?? 'no limit',
            },
            outfits: enriched,
            generalAdvice: parsed.generalAdvice,
            productCount: complementary.length + 1,
        };
    }
    formatProduct(product, index) {
        const price = Number(product.variants[0]?.priceOverride ?? product.basePrice ?? 0);
        const colors = [
            ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
        ];
        const variantId = product.variants[0]?.id ?? 'N/A';
        return [
            index !== undefined ? `${index}.` : '•',
            `ID: ${product.id}`,
            `VariantID: ${variantId}`,
            `Name: ${product.name}`,
            `Category: ${product.category?.name ?? 'N/A'}`,
            `Colors: ${colors.join(', ') || 'N/A'}`,
            `Price: $${price.toFixed(2)}`,
        ].join(' | ');
    }
    formatCatalog(candidates) {
        const sections = [];
        let idx = 1;
        for (const [group, products] of Object.entries(candidates)) {
            if (products.length === 0)
                continue;
            sections.push(`\n=== ${group.toUpperCase()} ===`);
            products.forEach(p => {
                sections.push(this.formatProduct(p, idx++));
            });
        }
        return sections.join('\n');
    }
    buildOutfitPrompt(dto, catalog) {
        const budgetLine = dto.budgetCents
            ? `Total budget: $${(dto.budgetCents / 100).toFixed(2)}`
            : 'No strict budget';
        const bodyLine = dto.bodyType
            ? `Body type: ${dto.bodyType} — suggest flattering silhouettes`
            : '';
        const freeTextLine = dto.freeText
            ? `Additional request: "${dto.freeText}"`
            : '';
        const count = dto.outfitCount ?? 1;
        return `You are a world-class luxury fashion stylist with decades of editorial experience.
Your job is to create ${count} complete, wearable outfit(s) using ONLY the real products listed below.

Customer Preferences:
- Occasion: ${dto.occasion}
- Season: ${dto.season}
- Style: ${dto.style}
- Preferred color: ${dto.preferredColor ?? 'open to suggestions'}
- ${budgetLine}
${bodyLine}
${freeTextLine}

AVAILABLE PRODUCTS (use ONLY these — never invent products):
${catalog}

Return a JSON object with EXACTLY this structure:
{
  "outfits": [
    {
      "outfitIndex": 1,
      "title": "A creative outfit name (e.g. 'Garden Ceremony Elegance')",
      "theme": "2-4 word aesthetic tag (e.g. 'Refined Summer Chic')",
      "stylingNotes": "2-3 sentences explaining the look, why items work together, and how to wear it",
      "items": [
        {
          "productId": "exact product ID from the list",
          "variantId": "exact variant ID from the list",
          "name": "exact product name",
          "category": "category name",
          "color": "chosen color",
          "price": 0.00,
          "reason": "one sentence: why this specific piece was chosen for this outfit"
        }
      ],
      "totalPrice": 0.00,
      "alternativeTip": "One sentence tip to restyle or swap one item for a different occasion"
    }
  ],
  "generalAdvice": "2 sentences of general styling advice for this occasion/season"
}

Strict rules:
1. ONLY use product IDs and variant IDs from the list above — never invent fictional products
2. Each outfit must include: one main piece (dress OR top+bottom), shoes, and 1-2 accessories
3. Items must work together visually — consider color harmony and style cohesion
4. Respect the budget — totalPrice must not exceed the budget if provided
5. Return ONLY the JSON object, no markdown, no extra text`;
    }
    async callClaude(prompt) {
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-opus-4-5',
                max_tokens: 2000,
                messages: [{ role: 'user', content: prompt }],
            });
            const content = response.content[0];
            if (content.type !== 'text') {
                throw new common_1.InternalServerErrorException('Unexpected AI response type.');
            }
            return content.text;
        }
        catch (error) {
            this.logger.error(`Claude API error: ${error.message}`);
            throw new common_1.InternalServerErrorException('AI stylist is temporarily unavailable. Please try again.');
        }
    }
    parseAiResponse(raw) {
        try {
            const cleaned = raw
                .replace(/```json\n?/gi, '')
                .replace(/```\n?/gi, '')
                .trim();
            const parsed = JSON.parse(cleaned);
            if (!parsed.outfits || !Array.isArray(parsed.outfits)) {
                throw new Error('Missing outfits array in AI response');
            }
            return {
                outfits: parsed.outfits,
                generalAdvice: parsed.generalAdvice ?? '',
            };
        }
        catch (err) {
            this.logger.error(`Failed to parse AI response: ${err.message}\nRaw: ${raw}`);
            throw new common_1.InternalServerErrorException('Failed to process AI styling recommendations. Please try again.');
        }
    }
    enrichOutfits(aiOutfits, allProducts) {
        const productMap = new Map(allProducts.map((p) => [p.id, p]));
        return aiOutfits.map((outfit) => {
            const enrichedItems = (outfit.items ?? [])
                .map((item) => {
                const dbProduct = productMap.get(item.productId);
                if (!dbProduct) {
                    this.logger.warn(`AI returned unknown productId: ${item.productId} — skipping`);
                    return null;
                }
                const dbVariant = dbProduct?.variants?.find((v) => v.id === item.variantId, dbProduct?.variants?.[0]);
                return {
                    productId: dbProduct.id,
                    variantId: dbVariant?.id ?? '',
                    name: dbProduct.name,
                    category: dbProduct.category?.name ?? item.category,
                    color: dbVariant?.color ?? item.color ?? 'N/A',
                    price: Number(dbVariant?.priceOverride ?? dbProduct.basePrice ?? item.price),
                    image: dbVariant?.images?.[0] ?? null,
                    reason: item.reason ?? '',
                };
            })
                .filter(Boolean);
            const totalPrice = enrichedItems.reduce((sum, i) => sum + i.price, 0);
            return {
                outfitIndex: outfit.outfitIndex ?? 1,
                title: outfit.title ?? 'Styled Look',
                theme: outfit.theme ?? '',
                stylingNotes: outfit.stylingNotes ?? '',
                items: enrichedItems,
                totalPrice: Math.round(totalPrice * 100) / 100,
                alternativeTip: outfit.alternativeTip ?? '',
            };
        });
    }
};
exports.StylistService = StylistService;
exports.StylistService = StylistService = StylistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Stylist_repository_1.StylistRepository,
        config_1.ConfigService])
], StylistService);
//# sourceMappingURL=stylist.service.js.map