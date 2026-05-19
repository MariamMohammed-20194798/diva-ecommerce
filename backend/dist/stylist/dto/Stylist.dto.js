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
exports.CompleteTheLookDto = exports.GenerateOutfitDto = exports.BodyType = exports.StylePreference = exports.Season = exports.Occasion = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var Occasion;
(function (Occasion) {
    Occasion["WEDDING"] = "wedding";
    Occasion["BUSINESS"] = "business";
    Occasion["CASUAL"] = "casual";
    Occasion["COCKTAIL"] = "cocktail";
    Occasion["BEACH"] = "beach";
    Occasion["DINNER"] = "dinner";
    Occasion["PARTY"] = "party";
    Occasion["GYM"] = "gym";
    Occasion["DATE_NIGHT"] = "date_night";
    Occasion["BRUNCH"] = "brunch";
})(Occasion || (exports.Occasion = Occasion = {}));
var Season;
(function (Season) {
    Season["SPRING"] = "spring";
    Season["SUMMER"] = "summer";
    Season["AUTUMN"] = "autumn";
    Season["WINTER"] = "winter";
    Season["ALL"] = "all";
})(Season || (exports.Season = Season = {}));
var StylePreference;
(function (StylePreference) {
    StylePreference["ELEGANT"] = "elegant";
    StylePreference["CASUAL"] = "casual";
    StylePreference["BOHEMIAN"] = "bohemian";
    StylePreference["MINIMALIST"] = "minimalist";
    StylePreference["SPORTY"] = "sporty";
    StylePreference["ROMANTIC"] = "romantic";
    StylePreference["EDGY"] = "edgy";
    StylePreference["CLASSIC"] = "classic";
    StylePreference["LUXURY"] = "luxury";
    StylePreference["STREETWEAR"] = "streetwear";
})(StylePreference || (exports.StylePreference = StylePreference = {}));
var BodyType;
(function (BodyType) {
    BodyType["HOURGLASS"] = "hourglass";
    BodyType["PEAR"] = "pear";
    BodyType["APPLE"] = "apple";
    BodyType["RECTANGLE"] = "rectangle";
    BodyType["INVERTED_TRIANGLE"] = "inverted_triangle";
})(BodyType || (exports.BodyType = BodyType = {}));
class GenerateOutfitDto {
    occasion;
    season;
    style;
    preferredColor;
    budgetCents;
    bodyType;
    outfitCount = 1;
    freeText;
}
exports.GenerateOutfitDto = GenerateOutfitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Occasion, example: Occasion.WEDDING }),
    (0, class_validator_1.IsEnum)(Occasion),
    __metadata("design:type", String)
], GenerateOutfitDto.prototype, "occasion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Season, example: Season.SUMMER }),
    (0, class_validator_1.IsEnum)(Season),
    __metadata("design:type", String)
], GenerateOutfitDto.prototype, "season", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: StylePreference, example: StylePreference.ELEGANT }),
    (0, class_validator_1.IsEnum)(StylePreference),
    __metadata("design:type", String)
], GenerateOutfitDto.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred color (e.g. black, navy, blush)',
        example: 'black',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], GenerateOutfitDto.prototype, "preferredColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum budget in cents (e.g. 15000 = $150)',
        example: 15000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], GenerateOutfitDto.prototype, "budgetCents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: BodyType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BodyType),
    __metadata("design:type", String)
], GenerateOutfitDto.prototype, "bodyType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of outfit combinations to generate (1–3)',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], GenerateOutfitDto.prototype, "outfitCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Free-text description of the look (e.g. "flowy and romantic")',
        example: 'Something flowy and romantic for a garden ceremony',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], GenerateOutfitDto.prototype, "freeText", void 0);
class CompleteTheLookDto {
    productId;
    occasion;
    budgetCents;
}
exports.CompleteTheLookDto = CompleteTheLookDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID of the anchor product to build the look around',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteTheLookDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Occasion }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Occasion),
    __metadata("design:type", String)
], CompleteTheLookDto.prototype, "occasion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Budget for the accessory suggestions only, in cents',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CompleteTheLookDto.prototype, "budgetCents", void 0);
//# sourceMappingURL=Stylist.dto.js.map