import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import {
  ApiProtectedEndpointErrors,
  ApiValidationErrorResponse,
} from '../common/swagger/api-responses';

type AuthUser = { sub?: string; id?: string; role?: string };

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(SWAGGER_BEARER_NAME)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  private getAuthUser(req: Request): AuthUser | undefined {
    const requestWithUser = req as unknown as { user?: AuthUser };
    return requestWithUser.user;
  }

  private getAuthUserId(req: Request): string {
    const user = this.getAuthUser(req);
    const userId = user?.sub ?? user?.id;
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return userId;
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Current user's reviews",
    description:
      'Returns all reviews written by the authenticated user with product info.',
  })
  @ApiOkResponse({ description: 'Array of reviews for the current user' })
  @ApiProtectedEndpointErrors()
  async findMyReviews(@Req() req: Request) {
    const userId = this.getAuthUserId(req);
    return this.reviewsService.findMyReviews(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a review',
    description:
      'Creates a review for a purchased product (shipped/delivered only). One review per user per product.',
  })
  @ApiCreatedResponse({ description: 'Review created' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Product not purchased yet' })
  @ApiConflictResponse({ description: 'User already reviewed this product' })
  @ApiValidationErrorResponse()
  @ApiProtectedEndpointErrors()
  @ApiBody({
    type: CreateReviewDto,
    examples: {
      default: {
        summary: 'Five-star review',
        value: {
          productId: '550e8400-e29b-41d4-a716-446655440004',
          rating: 5,
          body: 'Excellent quality and fit!',
        },
      },
    },
  })
  async create(@Body() dto: CreateReviewDto, @Req() req: Request) {
    const userId = this.getAuthUserId(req);
    return this.reviewsService.create(userId, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update own review',
    description:
      'Users can update only their own review. Supports partial update of rating/body.',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiOkResponse({ description: 'Review updated' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiForbiddenResponse({ description: 'Cannot update another user review' })
  @ApiProtectedEndpointErrors()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: Request,
  ) {
    const userId = this.getAuthUserId(req);
    return this.reviewsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a review',
    description:
      'Users can delete their own reviews. Admin users can delete any review.',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiOkResponse({ description: 'Review deleted' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiForbiddenResponse({ description: 'Cannot delete another user review' })
  @ApiProtectedEndpointErrors()
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = this.getAuthUser(req);
    const userId = this.getAuthUserId(req);
    return this.reviewsService.remove(id, userId, user?.role);
  }
}
