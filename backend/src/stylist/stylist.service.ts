import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { StylistRepository } from './Stylist.repository';
import { GenerateOutfitDto, CompleteTheLookDto } from './dto/Stylist.dto';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutfitItem {
  productId: string;
  variantId: string;
  name: string;
  category: string;
  color: string;
  price: number;
  image: string | null;
  reason: string; // why this specific piece was chosen
}

interface OutfitSuggestion {
  outfitIndex: number;
  title: string; // e.g. "Garden Ceremony Elegance"
  theme: string; // short aesthetic description
  stylingNotes: string; // full AI styling explanation
  items: OutfitItem[];
  totalPrice: number;
  alternativeTip: string; // one tip to restyle the outfit
}

interface StylistResponse {
  preferences: Record<string, string | number>;
  outfits: OutfitSuggestion[];
  generalAdvice: string;
  productCount: number; // how many DB products were considered
}

@Injectable()
export class StylistService {
  private readonly anthropic: Anthropic;
  private readonly logger = new Logger(StylistService.name);

  constructor(
    private readonly repo: StylistRepository,
    private readonly config: ConfigService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  // ─── POST /stylist/outfit ─────────────────────────────────────────────────

  async generateOutfit(dto: GenerateOutfitDto): Promise<StylistResponse> {
    // Step 1 — Fetch real products from DB
    this.logger.log(
      `Fetching candidates for ${dto.occasion} / ${dto.style} / ${dto.season}`,
    );
    const candidates = await this.repo.fetchCandidateProducts(dto);

    const totalCount =
      candidates.dresses.length +
      candidates.tops.length +
      candidates.bottoms.length +
      candidates.outerwear.length +
      candidates.shoes.length +
      candidates.bags.length +
      candidates.accessories.length;

    if (totalCount === 0) {
      throw new BadRequestException(
        'No matching products found for your preferences. Try broadening your filters.',
      );
    }

    // Step 2 — Format products into a concise product catalog for the AI
    const catalog = this.formatCatalog(candidates);

    // Step 3 — Build the prompt and call Claude
    const prompt = this.buildOutfitPrompt(dto, catalog);

    this.logger.log(`Calling Claude with ${totalCount} candidate products`);
    const rawResponse = await this.callClaude(prompt);

    // Step 4 — Parse the structured JSON response
    const parsed = this.parseAiResponse(rawResponse);

    // Step 5 — Enrich items with real product/variant data from DB
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

  // ─── POST /stylist/complete-the-look ─────────────────────────────────────

  async completeTheLook(dto: CompleteTheLookDto): Promise<StylistResponse> {
    // Step 1 — Load the anchor product
    const anchor = await this.repo.fetchAnchorProduct(dto.productId);
    if (!anchor) {
      throw new NotFoundException(`Product "${dto.productId}" not found.`);
    }

    const anchorColor = anchor.variants[0]?.color ?? undefined;
    const anchorCategorySlug = anchor.category.slug;

    // Step 2 — Fetch complementary products
    const complementary = await this.repo.fetchComplementaryProducts(
      anchorCategorySlug,
      anchorColor,
      dto.budgetCents,
    );

    if (complementary.length === 0) {
      throw new BadRequestException('No complementary products found.');
    }

    // Step 3 — Build prompt with anchor context
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

    // Inject anchor as first item in each outfit
    const anchorItem: OutfitItem = {
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

  // ─── Private helpers ──────────────────────────────────────────────────────

  private formatProduct(product: any, index?: number): string {
    const price = Number(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      product.variants[0]?.priceOverride ?? product.basePrice ?? 0,
    );
    const colors = [
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      ...new Set(product.variants.map((v: any) => v.color).filter(Boolean)),
    ];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const variantId = product.variants[0]?.id ?? 'N/A';

    return [
      index !== undefined ? `${index}.` : '•',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `ID: ${product.id}`,
      `VariantID: ${variantId}`,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `Name: ${product.name}`,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `Category: ${product.category?.name ?? 'N/A'}`,
      `Colors: ${colors.join(', ') || 'N/A'}`,
      `Price: $${price.toFixed(2)}`,
    ].join(' | ');
  }

  private formatCatalog(candidates: Record<string, any[]>): string {
    const sections: string[] = [];
    let idx = 1;

    for (const [group, products] of Object.entries(candidates)) {
      if (products.length === 0) continue;
      sections.push(`\n=== ${group.toUpperCase()} ===`);
      products.forEach(p => {
        sections.push(this.formatProduct(p, idx++));
      });
    }

    return sections.join('\n');
  }

  private buildOutfitPrompt(dto: GenerateOutfitDto, catalog: string): string {
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

  private async callClaude(prompt: string): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const content = response.content[0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (content.type !== 'text') {
        throw new InternalServerErrorException('Unexpected AI response type.');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return content.text;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Claude API error: ${error.message}`);
      throw new InternalServerErrorException(
        'AI stylist is temporarily unavailable. Please try again.',
      );
    }
  }

  private parseAiResponse(raw: string): {
    outfits: any[];
    generalAdvice: string;
  } {
    try {
      // Strip any markdown code fences if present
      const cleaned = raw
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .trim();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(cleaned);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!parsed.outfits || !Array.isArray(parsed.outfits)) {
        throw new Error('Missing outfits array in AI response');
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        outfits: parsed.outfits,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        generalAdvice: parsed.generalAdvice ?? '',
      };
    } catch (err: any) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to parse AI response: ${err.message}\nRaw: ${raw}`,
      );
      throw new InternalServerErrorException(
        'Failed to process AI styling recommendations. Please try again.',
      );
    }
  }

  private enrichOutfits(
    aiOutfits: any[],
    allProducts: any[],
  ): OutfitSuggestion[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
  
    return aiOutfits.map((outfit) => {
      const enrichedItems: OutfitItem[] = (outfit.items ?? [])
        .map((item: any) => {
          const dbProduct = productMap.get(item.productId);
  
          // If AI hallucinated a product ID, skip gracefully
          if (!dbProduct) {
            this.logger.warn(
              `AI returned unknown productId: ${item.productId} — skipping`,
            );
  
            return null;
          }
  
          const dbVariant =
            dbProduct?.variants?.find(
              (v: any) => v.id === item.variantId,
            dbProduct?.variants?.[0];

          return {
            productId: dbProduct.id,
            variantId: dbVariant?.id ?? '',
            name: dbProduct.name,
            category: dbProduct.category?.name ?? item.category,
            color: dbVariant?.color ?? item.color ?? 'N/A',
            price: Number(
              dbVariant?.priceOverride ?? dbProduct.basePrice ?? item.price,
            ),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            image: dbVariant?.images?.[0] ?? null,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            reason: item.reason ?? '',
          } satisfies OutfitItem;
        })
        .filter(Boolean) as OutfitItem[];
  
      const totalPrice = enrichedItems.reduce(
        (sum, i) => sum + i.price,
        0,
      );
  
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        outfitIndex: outfit.outfitIndex ?? 1,
  
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        title: outfit.title ?? 'Styled Look',
  
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        theme: outfit.theme ?? '',
  
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        stylingNotes: outfit.stylingNotes ?? '',
  
        items: enrichedItems,
  
        totalPrice: Math.round(totalPrice * 100) / 100,
  
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        alternativeTip: outfit.alternativeTip ?? '',
      } satisfies OutfitSuggestion;
    });
  }
}