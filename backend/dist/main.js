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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express = __importStar(require("express"));
function parseAllowedOrigins() {
    const raw = [
        'http://localhost:3000',
        process.env.FRONTEND_URL,
        'https://ecommerce-app-omega-hazel.vercel.app',
    ];
    return new Set(raw
        .filter((value) => Boolean(value))
        .flatMap((value) => value.split(','))
        .map((origin) => origin.trim().replace(/\/$/, ''))
        .filter(Boolean));
}
function isVercelDeploymentOrigin(origin) {
    return /^https:\/\/[\w-]+\.vercel\.app$/i.test(origin);
}
function isLocalDevOrigin(origin) {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableShutdownHooks();
    const allowedOrigins = parseAllowedOrigins();
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            const normalized = origin.replace(/\/$/, '');
            if (allowedOrigins.has(normalized) ||
                isVercelDeploymentOrigin(normalized) ||
                (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(normalized))) {
                callback(null, origin);
                return;
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`), false);
        },
        credentials: true,
        exposedHeaders: ['x-session-id'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
    console.log(`Backend running on port ${process.env.PORT ?? 3001}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map