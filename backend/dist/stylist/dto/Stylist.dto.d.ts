export declare enum Occasion {
    WEDDING = "wedding",
    BUSINESS = "business",
    CASUAL = "casual",
    COCKTAIL = "cocktail",
    BEACH = "beach",
    DINNER = "dinner",
    PARTY = "party",
    GYM = "gym",
    DATE_NIGHT = "date_night",
    BRUNCH = "brunch"
}
export declare enum Season {
    SPRING = "spring",
    SUMMER = "summer",
    AUTUMN = "autumn",
    WINTER = "winter",
    ALL = "all"
}
export declare enum StylePreference {
    ELEGANT = "elegant",
    CASUAL = "casual",
    BOHEMIAN = "bohemian",
    MINIMALIST = "minimalist",
    SPORTY = "sporty",
    ROMANTIC = "romantic",
    EDGY = "edgy",
    CLASSIC = "classic",
    LUXURY = "luxury",
    STREETWEAR = "streetwear"
}
export declare enum BodyType {
    HOURGLASS = "hourglass",
    PEAR = "pear",
    APPLE = "apple",
    RECTANGLE = "rectangle",
    INVERTED_TRIANGLE = "inverted_triangle"
}
export declare class GenerateOutfitDto {
    occasion: Occasion;
    season: Season;
    style: StylePreference;
    preferredColor?: string;
    budgetCents?: number;
    bodyType?: BodyType;
    outfitCount?: number;
    freeText?: string;
}
export declare class CompleteTheLookDto {
    productId: string;
    occasion?: Occasion;
    budgetCents?: number;
}
