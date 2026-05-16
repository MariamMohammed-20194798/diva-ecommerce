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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_constants_1 = require("./auth.constants");
const send_otp_dto_1 = require("./dto/send-otp.dto");
const verify_otp_dto_1 = require("./dto/verify-otp.dto");
const google_oauth_configured_guard_1 = require("./guards/google-oauth-configured.guard");
let AuthController = class AuthController {
    auth;
    config;
    constructor(auth, config) {
        this.auth = auth;
        this.config = config;
    }
    sendOtp(dto) {
        return this.auth.sendOtp(dto);
    }
    async verifyOtp(dto, res) {
        const result = await this.auth.verifyOtp(dto);
        this.setRefreshCookie(res, result.refreshToken);
        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }
    async refresh(req, res) {
        const raw = req.cookies?.[auth_constants_1.REFRESH_COOKIE];
        const result = await this.auth.rotateRefresh(raw);
        this.setRefreshCookie(res, result.refreshToken);
        return { accessToken: result.accessToken, user: result.user };
    }
    async logout(req, res) {
        const raw = req.cookies?.[auth_constants_1.REFRESH_COOKIE];
        await this.auth.revokeRefresh(raw);
        this.clearRefreshCookie(res);
        return { ok: true };
    }
    googleAuth() {
    }
    async googleCallback(req, res) {
        const profile = req.user;
        const result = await this.auth.oauthLogin(profile);
        this.setRefreshCookie(res, result.refreshToken);
        const frontend = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        res.redirect(`${frontend.replace(/\/$/, '')}/auth/callback`);
    }
    refreshCookieOptions() {
        const maxAgeDays = Number(this.config.get('REFRESH_TOKEN_DAYS', '30'));
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
        const isProd = this.config.get('NODE_ENV') === 'production';
        const sameSite = isProd ? 'none' : 'lax';
        return {
            httpOnly: true,
            secure: isProd,
            sameSite,
            path: '/api/auth',
            maxAge: maxAgeMs,
        };
    }
    setRefreshCookie(res, token) {
        res.cookie(auth_constants_1.REFRESH_COOKIE, token, this.refreshCookieOptions());
    }
    clearRefreshCookie(res) {
        const isProd = this.config.get('NODE_ENV') === 'production';
        const sameSite = isProd ? 'none' : 'lax';
        res.clearCookie(auth_constants_1.REFRESH_COOKIE, {
            httpOnly: true,
            secure: isProd,
            sameSite,
            path: '/api/auth',
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('send-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_otp_dto_1.SendOtpDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_oauth_configured_guard_1.GoogleOAuthConfiguredGuard, (0, passport_1.AuthGuard)('google')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_oauth_configured_guard_1.GoogleOAuthConfiguredGuard, (0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map