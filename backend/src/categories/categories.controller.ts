import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { AdminGuard } from '../products/guards/admin.guard';
import {
  CategoriesQueryDto,
  CategoryProductsQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import { ApiAdminEndpointErrors } from '../common/swagger/api-responses';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories/tree
  //
  // Public. Returns ALL categories as a nested tree structure.
  // Useful for rendering a sidebar navigation menu.
  // Declared BEFORE /:slug so "tree" isn't captured as a slug param.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get full category tree',
    description:
      'Returns all categories as a nested tree. Each root category contains ' +
      'a "children" array with its subcategories. Useful for navigation menus.',
  })
  @ApiOkResponse({ description: 'Nested category tree' })
  async findTree() {
    return this.categoriesService.findTree();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories
  //
  // Public. Flat paginated list. Supports rootOnly and withCounts filters.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all categories',
    description:
      'Returns a flat paginated list of categories. Use rootOnly=true to get ' +
      'only top-level categories. Use withCounts=true to include product and ' +
      'subcategory counts per category.',
  })
  @ApiOkResponse({ description: 'Paginated list of categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'rootOnly',
    required: false,
    type: Boolean,
    description: 'Return only top-level categories',
  })
  @ApiQuery({
    name: 'withCounts',
    required: false,
    type: Boolean,
    description: 'Include product and subcategory counts',
  })
  async findAll(@Query() query: CategoriesQueryDto) {
    return this.categoriesService.findAll(query);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories/:slug
  //
  // Public. Single category detail with its parent and direct children.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get category by slug',
    description:
      'Returns a single category with its parent category and direct children. ' +
      'Also includes product count and children count.',
  })
  @ApiOkResponse({ description: 'Category with parent and children' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  async findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories/:slug/products
  //
  // Public. Paginated products belonging to this category.
  // Supports includeSubcategories to pull in products from child categories too.
  // ─────────────────────────────────────────────────────────────────────────────

  @Get(':slug/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get products by category',
    description:
      'Returns paginated products belonging to the given category. ' +
      'Set includeSubcategories=true to also include products from child ' +
      'subcategories (e.g. fetching all "Clothing" products includes T-Shirts, ' +
      'Hoodies, Bags, etc.).',
  })
  @ApiOkResponse({ description: 'Paginated product list for this category' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'includeSubcategories',
    required: false,
    type: Boolean,
    description: 'Also return products from child categories',
  })
  async findProducts(
    @Param('slug') slug: string,
    @Query() query: CategoryProductsQueryDto,
  ) {
    return this.categoriesService.findProducts(slug, query);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /categories
  //
  // Admin only. Create a new category or subcategory.
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Admin')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({
    summary: 'Create a category (admin)',
    description:
      'Creates a new category. Provide a parentId to make it a subcategory. ' +
      'Slug is auto-generated from name if not provided. Requires ADMIN role.',
  })
  @ApiCreatedResponse({ description: 'Category created successfully' })
  @ApiAdminEndpointErrors()
  @ApiConflictResponse({ description: 'Slug already exists' })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      default: {
        summary: 'Create root category',
        value: { name: 'T-Shirts', description: 'Custom printed tees' },
      },
    },
  })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /categories/:id
  //
  // Admin only. Partial update — send only fields that need changing.
  // ─────────────────────────────────────────────────────────────────────────────

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiOperation({
    summary: 'Update a category (admin)',
    description:
      'Updates a category. All fields are optional — only send what changes. ' +
      'To promote a subcategory to root level, set parentId to null. ' +
      'Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Category updated successfully' })
  @ApiAdminEndpointErrors()
  @ApiConflictResponse({ description: 'New slug already in use' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /categories/:id
  //
  // Admin only. Safe delete — blocked if the category has products or children.
  // ─────────────────────────────────────────────────────────────────────────────

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiOperation({
    summary: 'Delete a category (admin)',
    description:
      'Deletes a category. Will be rejected (422) if the category has any ' +
      'products assigned to it or has subcategories. You must reassign or ' +
      'delete those first. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Category deleted successfully' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Category has products or subcategories',
  })
  @ApiAdminEndpointErrors()
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.delete(id);
  }
}
