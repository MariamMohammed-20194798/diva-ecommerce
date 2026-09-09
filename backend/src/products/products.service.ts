import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import {
  ProductsQueryDto,
  SearchQueryDto,
  ReviewsQueryDto,
  CreateProductDto,
  UpdateProductDto,
} from './product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepo: ProductRepository) {}

  // ─── GET /products ────────────────────────────────────────────────────────────

  async findAll(query: ProductsQueryDto) {
    return this.productsRepo.findMany(query);
  }

  // ─── GET /products/:slug ──────────────────────────────────────────────────────

  async findBySlug(slug: string) {
    const product = await this.productsRepo.findBySlug(slug);

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    }

    return product;
  }

  // ─── GET /products/search?q= ──────────────────────────────────────────────────

  async search(query: SearchQueryDto) {
    return this.productsRepo.search(query);
  }

  // ─── GET /products/:id/reviews ────────────────────────────────────────────────

  async findReviews(productId: string, query: ReviewsQueryDto) {
    // Verify the product actually exists before fetching its reviews
    const product = await this.productsRepo.findById(productId);

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${productId}" was not found.`,
      );
    }

    return this.productsRepo.findReviews(productId, query);
  }

  // ─── POST /products ───────────────────────────────────────────────────────────

  async create(dto: CreateProductDto) {
    // Auto-generate slug if not provided
    const slug =
      dto.slug ??
      dto.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Enforce slug uniqueness
    const exists = await this.productsRepo.slugExists(slug);
    if (exists) {
      throw new ConflictException(
        `A product with slug "${slug}" already exists. Provide a unique slug.`,
      );
    }

    return this.productsRepo.create({ ...dto, slug });
  }

  // ─── PUT /products/:id ────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productsRepo.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" was not found.`);
    }

    return this.productsRepo.update(id, dto);
  }
}
