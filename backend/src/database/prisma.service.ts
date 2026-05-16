import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  getPooledDatabaseUrl,
  isRetryablePrismaError,
  sleep,
} from '../config/database-url';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaService | undefined;
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (globalForPrisma.prisma) {
      return globalForPrisma.prisma;
    }

    super({
      datasources: {
        db: {
          url: getPooledDatabaseUrl(),
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

  private async connectWithRetry(maxAttempts = 5): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        if (!isRetryablePrismaError(error) || attempt === maxAttempts) {
          throw error;
        }
        const delayMs = 1000 * attempt;
        this.logger.warn(
          `Database connect attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms`,
        );
        await sleep(delayMs);
      }
    }
  }
}
