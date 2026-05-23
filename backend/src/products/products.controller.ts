import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import { ApiAdminEndpointErrors } from '../common/swagger/api-responses';

import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { AdminGuard } from './guards/admin.guard';
import {
  ProductsQueryDto,
  SearchQueryDto,
  ReviewsQueryDto,
  CreateProductDto,
  UpdateProductDto,
} from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /products/search?q=
  //
  // IMPORTANT: This route MUST be declared before GET /products/:slug
  // because Express/NestJS matches routes in order — if /:slug comes first,
  // "search" would be captured as a slug parameter.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Full-text product search',
    description:
      'Searches product names and descriptions using PostgreSQL pg_trgm + tsvector. ' +
      'Requires the pg_trgm extension and a GIN index on the products table.',
  })
  @ApiOkResponse({ description: 'Paginated search results' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(@Query() query: SearchQueryDto) {
    return this.productsService.search(query);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /products
  //
  // Public. Paginated list with optional filters: category, size, color,
  // price range, and sort order.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all products',
    description:
      'Returns a paginated list of active products. Supports filtering by ' +
      'category (slug or ID), size, color, price range, and sort order.',
  })
  @ApiOkResponse({ description: 'Paginated product list with metadata' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'size', required: false, type: String })
  @ApiQuery({ name: 'color', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['price_asc', 'price_desc', 'newest', 'popular', 'rating'],
  })
  async findAll(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /products/:slug
  //
  // Public. Returns full product detail: all variants, first page of reviews,
  // category, and aggregate review count.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get product by slug',
    description:
      'Returns full product detail including all variants and the most ' +
      'recent 5 reviews. Use the slug (SEO-friendly URL) not the UUID.',
  })
  @ApiOkResponse({ description: 'Product with variants and reviews' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({
    name: 'slug',
    description: 'Product URL slug',
    example: 'classic-black-tee',
  })
  async findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /products/:id/reviews
  //
  // Public. Paginated reviews for a product. Supports optional rating filter.
  // Uses UUID not slug because it's a sub-resource of a known product.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get(':id/reviews')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get reviews for a product',
    description:
      'Returns paginated reviews for the given product UUID, with ' +
      'average rating and total count in the response metadata.',
  })
  @ApiOkResponse({ description: 'Paginated reviews with rating summary' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'rating',
    required: false,
    type: Number,
    description: '1–5',
  })
  async findReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ReviewsQueryDto,
  ) {
    return this.productsService.findReviews(id, query);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /products
  //
  // Admin only. Creates a product with optional variants in one request.
  // Requires JWT + ADMIN role.
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Admin')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({
    summary: 'Create a product (admin)',
    description:
      'Creates a new product and optionally its variants in a single request. ' +
      'Slug is auto-generated from the name if not provided. ' +
      'Requires ADMIN role.',
  })
  @ApiCreatedResponse({ description: 'Product created successfully' })
  @ApiAdminEndpointErrors()
  @ApiBody({
    type: CreateProductDto,
    examples: {
      default: {
        summary: 'Create product with variants',
        value: {
          name: 'Classic Black Tee',
          slug: 'classic-black-tee',
          categoryId: '550e8400-e29b-41d4-a716-446655440003',
          basePrice: 2999,
          isActive: true,
          variants: [
            {
              sku: 'TSHIRT-BLK-M',
              size: 'M',
              color: 'black',
              stockQuantity: 100,
            },
          ],
        },
      },
    },
  })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /products/:id
  //
  // Admin only. Partial update of product fields (not variants — manage
  // variants via /products/:id/variants endpoints, to be added).
  // ─────────────────────────────────────────────────────────────────────────────

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiOperation({
    summary: 'Update a product (admin)',
    description:
      'Updates product fields. All fields are optional — send only what needs changing. ' +
      'To manage variants, use the /products/:id/variants endpoints. ' +
      'Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Product updated successfully' })
  @ApiAdminEndpointErrors()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }
}
