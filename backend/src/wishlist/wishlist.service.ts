import { Injectable, NotFoundException } from '@nestjs/common';
import { WishlistRepository } from './wishlist.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getWishlist(userId: string) {
    return this.wishlistRepository.findByUserId(userId);
  }

  async addToWishlist(userId: string, variantId: string, image?: string) {
    // Validate variant exists
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return this.wishlistRepository.add(userId, variantId, image);
  }

  async removeFromWishlist(userId: string, variantId: string) {
    return this.wishlistRepository.remove(userId, variantId);
  }

  async checkWishlistStatus(userId: string, variantId: string) {
    const isWishlisted = await this.wishlistRepository.exists(
      userId,
      variantId,
    );
    return { isWishlisted };
  }
}
