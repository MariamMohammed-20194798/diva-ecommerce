"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    config;
    logger = new common_1.Logger(MailService_1.name);
    resend;
    transporter;
    constructor(config) {
        this.config = config;
        const resendKey = this.config.get('RESEND_API_KEY');
        this.resend = resendKey ? new resend_1.Resend(resendKey) : null;
        const smtpHost = this.config.get('SMTP_HOST');
        const smtpPort = this.config.get('SMTP_PORT', 587);
        const smtpUser = this.config.get('SMTP_USER');
        const smtpPass = this.config.get('SMTP_PASS');
        if (smtpHost && smtpUser && smtpPass) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
            this.logger.log('Nodemailer transporter initialized');
        }
        else {
            this.transporter = null;
            this.logger.warn('Nodemailer SMTP config missing; skipping initialization');
        }
    }
    async sendVerificationEmail(to, verifyUrl) {
        const from = this.config.get('EMAIL_FROM', 'noreply@ecommerce.com');
        this.logger.log(`Verification email URL for ${to}: ${verifyUrl}`);
        if (!this.resend) {
            this.logger.warn(`RESEND_API_KEY not set; skipping verification email to ${to}. URL: ${verifyUrl}`);
            return;
        }
        await this.resend.emails.send({
            from,
            to,
            subject: 'Verify your email',
            html: `<p>Click to verify your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
        });
        this.logger.log(`Verification email sent to ${to}`);
    }
    async sendOtpEmail(to, code) {
        if (this.transporter) {
            return this.sendOtpEmailNodemailer(to, code);
        }
        return this.sendOtpEmailResend(to, code);
    }
    async sendOtpEmailNodemailer(to, code) {
        if (!this.transporter) {
            this.logger.error('[Nodemailer] Cannot send email: Transporter not initialized');
            return;
        }
        const from = this.config.get('EMAIL_FROM', '"DIVA Brand" <noreply@ecommerce.com>');
        this.logger.log(`[Nodemailer] Sending OTP to ${to}: ${code}`);
        try {
            await this.transporter.sendMail({
                from,
                to,
                subject: 'Your One-Time Password (OTP)',
                html: `<p>Your one-time password is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
            });
            this.logger.log(`[Nodemailer] OTP email sent successfully to ${to}`);
        }
        catch (err) {
            this.logger.error(`[Nodemailer] Failed to send email: ${err.message}`);
        }
    }
    async sendOtpEmailResend(to, code) {
        const from = this.config.get('EMAIL_FROM') || 'onboarding@resend.dev';
        this.logger.log(`[Resend] Attempting to send OTP to ${to}: ${code}`);
        if (!this.resend) {
            this.logger.warn(`RESEND_API_KEY not set; skipping Resend OTP email.`);
            return;
        }
        try {
            const { data, error } = await this.resend.emails.send({
                from,
                to,
                subject: 'Your One-Time Password (OTP)',
                html: `<p>Your one-time password is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
            });
            if (error) {
                this.logger.error(`Resend Error: ${JSON.stringify(error)}`);
                return;
            }
            this.logger.log(`[Resend] OTP email sent successfully! ID: ${data?.id}`);
        }
        catch (err) {
            this.logger.error(`[Resend] Failed to send email: ${err.message}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map