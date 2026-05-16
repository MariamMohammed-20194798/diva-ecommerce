import { ReviewRepository } from './review.repository';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
export declare class ReviewsService {
    private readonly reviewsRepo;
    constructor(reviewsRepo: ReviewRepository);
    findMyReviews(userId: string): Promise<({
        user: {
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    })[]>;
    create(userId: string, dto: CreateReviewDto): Promise<{
        user: {
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateReviewDto): Promise<{
        user: {
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        productId: string;
        body: string | null;
    }>;
    remove(id: string, userId: string, role?: string): Promise<{
        message: string;
    }>;
}
