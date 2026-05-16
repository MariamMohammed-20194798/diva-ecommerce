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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const database_url_1 = require("../config/database-url");
const globalForPrisma = globalThis;
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    constructor() {
        if (globalForPrisma.prisma) {
            return globalForPrisma.prisma;
        }
        super({
            datasources: {
                db: {
                    url: (0, database_url_1.getPooledDatabaseUrl)(),
                },
            },
        });
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = this;
        }
    }
    async onModuleInit() {
        await this.connectWithRetry();
    }
    async onModuleDestroy() {
        await this.$disconnect();
        if (globalForPrisma.prisma === this) {
            globalForPrisma.prisma = undefined;
        }
    }
    async connectWithRetry(maxAttempts = 5) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.$connect();
                return;
            }
            catch (error) {
                if (!(0, database_url_1.isRetryablePrismaError)(error) || attempt === maxAttempts) {
                    throw error;
                }
                const delayMs = 1000 * attempt;
                this.logger.warn(`Database connect attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms`);
                await (0, database_url_1.sleep)(delayMs);
            }
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map