import { Module } from '@nestjs/common';
import { StylistController } from './stylist.controller';
import { StylistService } from './stylist.service';
import { StylistRepository } from './Stylist.repository';

/**
 * StylistModule — AI Outfit Stylist
 *
 * Endpoints:
 *   POST /stylist/outfit              — generate outfit from preferences
 *   POST /stylist/complete-the-look   — suggest accessories for a product
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  — Claude API key (get from console.anthropic.com)
 *
 * Install SDK:
 *   pnpm add @anthropic-ai/sdk
 *
 * Dependencies:
 *   PrismaService  — injected globally via DatabaseModule
 *   ConfigService  — injected globally via ConfigModule
 *   JwtAuthGuard   — from AuthModule
 *
 * Add to app.module.ts:
 *   imports: [..., StylistModule]
 */
@Module({
  controllers: [StylistController],
  providers: [StylistService, StylistRepository],
  exports: [StylistService],
})
export class StylistModule {}
