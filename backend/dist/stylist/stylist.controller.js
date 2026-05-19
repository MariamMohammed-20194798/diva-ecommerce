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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stylist_service_1 = require("./stylist.service");
const Stylist_dto_1 = require("./dto/Stylist.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth-guard");
let StylistController = class StylistController {
    stylistService;
    constructor(stylistService) {
        this.stylistService = stylistService;
    }
    generateOutfit(dto) {
        return this.stylistService.generateOutfit(dto);
    }
    completeTheLook(dto) {
        return this.stylistService.completeTheLook(dto);
    }
};
exports.StylistController = StylistController;
__decorate([
    (0, common_1.Post)('outfit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate AI outfit from user preferences',
        description: 'Fetches real products from the database, then uses Claude AI to ' +
            'intelligently combine them into complete, stylish outfits tailored to ' +
            "the user's occasion, season, style, color, and budget. " +
            'Returns 1–3 outfit suggestions with styling notes, item reasons, and total price.',
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Outfit suggestions generated from real products',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'No matching products found or invalid preferences',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Stylist_dto_1.GenerateOutfitDto]),
    __metadata("design:returntype", void 0)
], StylistController.prototype, "generateOutfit", null);
__decorate([
    (0, common_1.Post)('complete-the-look'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: '"Complete the Look" — AI suggests accessories for a product',
        description: 'Shown on product detail pages. The user has already chosen an anchor ' +
            'product; this endpoint suggests matching shoes, bags, and accessories ' +
            'from the real database to complete the look. ' +
            'The anchor product is included as item[0] in the response.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Complementary look generated' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Anchor product not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'No complementary products available' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Stylist_dto_1.CompleteTheLookDto]),
    __metadata("design:returntype", void 0)
], StylistController.prototype, "completeTheLook", null);
exports.StylistController = StylistController = __decorate([
    (0, swagger_1.ApiTags)('ai-stylist'),
    (0, common_1.Controller)('stylist'),
    __metadata("design:paramtypes", [stylist_service_1.StylistService])
], StylistController);
//# sourceMappingURL=stylist.controller.js.map