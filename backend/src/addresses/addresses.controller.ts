import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import { ApiProtectedEndpointErrors } from '../common/swagger/api-responses';

@ApiTags('Users')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(SWAGGER_BEARER_NAME)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  private getAuthUserId(req: Request) {
    const user = req as unknown as { user?: { sub?: string; id?: string } };
    return user.user?.sub ?? user.user?.id;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List saved addresses',
    description:
      'Returns all saved addresses for the authenticated user. Default address appears first.',
  })
  @ApiOkResponse({ description: 'Array of user addresses' })
  @ApiProtectedEndpointErrors()
  async findAll(@Req() req: Request) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.addressesService.findAll(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single address by id' })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiOkResponse({ description: 'Address detail' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiProtectedEndpointErrors()
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.addressesService.findOne(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new address',
    description:
      'Creates an address for the authenticated user. First address is automatically default.',
  })
  @ApiCreatedResponse({ description: 'Address created' })
  @ApiProtectedEndpointErrors()
  @ApiBody({
    type: CreateAddressDto,
    examples: {
      default: {
        summary: 'Shipping address',
        value: {
          line1: '123 Rue de Rivoli',
          line2: 'Apt 5B',
          city: 'Paris',
          state: 'Ile-de-France',
          postalCode: '75001',
          country: 'France',
          isDefault: true,
        },
      },
    },
  })
  async create(@Body() dto: CreateAddressDto, @Req() req: Request) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.addressesService.create(userId, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an existing address',
    description:
      'Partial update is supported: only send fields you want to modify.',
  })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiOkResponse({ description: 'Address updated' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiProtectedEndpointErrors()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @Req() req: Request,
  ) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.addressesService.update(id, userId, dto);
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set address as default',
    description:
      'Sets this address as default and unsets all others for the user.',
  })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiOkResponse({ description: 'Address marked as default' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiProtectedEndpointErrors()
  async setDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.addressesService.setDefault(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an address',
    description:
      'Cannot delete default address when other addresses exist, or addresses linked to orders.',
  })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiOkResponse({ description: 'Address deleted successfully' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Address cannot be deleted due to business rules.',
  })
  @ApiProtectedEndpointErrors()
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id.');
    }
    return this.addressesService.remove(id, userId);
  }
}
