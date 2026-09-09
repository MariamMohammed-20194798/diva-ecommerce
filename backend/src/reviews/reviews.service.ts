import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CreateReviewDto, UpdateReviewDto } from './review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepo: ReviewRepository) {}

  async findMyReviews(userId: string) {
    return this.reviewsRepo.findMyReviews(userId);
  }

  async create(userId: string, dto: CreateReviewDto) {
    const product = await this.reviewsRepo.productExists(dto.productId);
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" was not found.`,
      );
    }

    const hasPurchased = await this.reviewsRepo.hasPurchasedProduct(
      userId,
      dto.productId,
    );
    if (!hasPurchased) {
      throw new BadRequestException(
        'You can only review products from shipped or delivered orders.',
      );
    }

    const existing = await this.reviewsRepo.findUserReviewForProduct(
      userId,
      dto.productId,
    );
    if (existing) {
      throw new ConflictException(
        'You have already reviewed this product. You can edit your existing review.',
      );
    }

    return this.reviewsRepo.create({
      userId,
      productId: dto.productId,
      rating: dto.rating,
      body: dto.body,
    });
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) {
      throw new NotFoundException(`Review "${id}" was not found.`);
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews.');
    }

    return this.reviewsRepo.update(id, {
      ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
      ...(dto.body !== undefined ? { body: dto.body } : {}),
    });
  }

  async remove(id: string, userId: string, role?: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) {
      throw new NotFoundException(`Review "${id}" was not found.`);
    }

    const isAdmin = role === 'ADMIN';
    const isOwner = review.userId === userId;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You can only delete your own review unless you are an admin.',
      );
    }

    await this.reviewsRepo.remove(id);
    return { message: `Review "${id}" deleted successfully.` };
  }
}
