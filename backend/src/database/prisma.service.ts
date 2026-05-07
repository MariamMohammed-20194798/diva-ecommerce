import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log("DB URL:", process.env.DATABASE_URL?.slice(0, 60));

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
