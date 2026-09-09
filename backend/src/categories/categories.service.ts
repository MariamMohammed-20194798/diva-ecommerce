import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import {
  CategoriesQueryDto,
  CategoryProductsQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  // Slug generator

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD') // decompose accented chars
      .replace(/[\u0300-\u036f]/g, '') // strip accent marks
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-') // spaces → hyphens
      .replace(/-+/g, '-') // collapse multiple hyphens
      .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
  }

  // GET /categories

  async findAll(query: CategoriesQueryDto) {
    return this.categoryRepo.findAll(query);
  }

  // GET /categories/tree

  async findTree() {
    return this.categoryRepo.findTree();
  }

  //  GET /categories/:slug
  async findBySlug(slug: string) {
    const category = await this.categoryRepo.findBySlug(slug);

    if (!category) {
      throw new NotFoundException(
        `Category with slug "${slug}" was not found.`,
      );
    }

    return category;
  }

  // GET /categories/:slug/products

  async findProducts(slug: string, query: CategoryProductsQueryDto) {
    const result = await this.categoryRepo.findProductsBySlug(slug, query);

    if (!result) {
      throw new NotFoundException(
        `Category with slug "${slug}" was not found.`,
      );
    }

    return result;
  }

  // POST /categories

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ?? this.generateSlug(dto.name);

    // Enforce slug uniqueness
    const slugTaken = await this.categoryRepo.slugExists(slug);
    if (slugTaken) {
      throw new ConflictException(
        `A category with slug "${slug}" already exists. ` +
          `Provide a unique slug or use a different name.`,
      );
    }

    // Validate parentId exists if provided
    if (dto.parentId) {
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID "${dto.parentId}" was not found.`,
        );
      }
    }

    return this.categoryRepo.create({ ...dto, slug });
  }

  // PUT /categories/:id

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID "${id}" was not found.`);
    }

    // If a new slug is provided or name changed, check uniqueness
    const newSlug =
      dto.slug ?? (dto.name ? this.generateSlug(dto.name) : undefined);

    if (newSlug && newSlug !== existing.slug) {
      const slugTaken = await this.categoryRepo.slugExists(newSlug, id);
      if (slugTaken) {
        throw new ConflictException(
          `A category with slug "${newSlug}" already exists.`,
        );
      }
    }

    // Validate new parentId exists if provided
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID "${dto.parentId}" was not found.`,
        );
      }
    }

    return this.categoryRepo.update(id, {
      ...dto,
      ...(newSlug ? { slug: newSlug } : {}),
    });
  }

  // DELETE /categories/:id

  async delete(id: string) {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID "${id}" was not found.`);
    }

    // Block deletion if the category has products assigned to it
    const hasProducts = await this.categoryRepo.hasProducts(id);
    if (hasProducts) {
      throw new UnprocessableEntityException(
        'Cannot delete a category that has products assigned to it. ' +
          'Reassign or delete the products first.',
      );
    }

    // Block deletion if the category has subcategories
    const hasChildren = await this.categoryRepo.hasChildren(id);
    if (hasChildren) {
      throw new UnprocessableEntityException(
        'Cannot delete a category that has subcategories. ' +
          'Delete or re-parent the subcategories first.',
      );
    }

    await this.categoryRepo.delete(id);

    return {
      message: `Category "${existing.name}" was deleted successfully.`,
    };
  }
}
