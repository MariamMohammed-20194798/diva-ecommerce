import { ConfigService } from '@nestjs/config';
import { StylistRepository } from './Stylist.repository';
import { GenerateOutfitDto, CompleteTheLookDto } from './dto/Stylist.dto';
interface OutfitItem {
    productId: string;
    variantId: string;
    name: string;
    category: string;
    color: string;
    price: number;
    image: string | null;
    reason: string;
}
interface OutfitSuggestion {
    outfitIndex: number;
    title: string;
    theme: string;
    stylingNotes: string;
    items: OutfitItem[];
    totalPrice: number;
    alternativeTip: string;
}
interface StylistResponse {
    preferences: Record<string, string | number>;
    outfits: OutfitSuggestion[];
    generalAdvice: string;
    productCount: number;
}
export declare class StylistService {
    private readonly repo;
    private readonly config;
    private readonly anthropic;
    private readonly logger;
    constructor(repo: StylistRepository, config: ConfigService);
    generateOutfit(dto: GenerateOutfitDto): Promise<StylistResponse>;
    completeTheLook(dto: CompleteTheLookDto): Promise<StylistResponse>;
    private formatProduct;
    private formatCatalog;
    private buildOutfitPrompt;
    private callClaude;
    private parseAiResponse;
    private enrichOutfits;
}
export {};
