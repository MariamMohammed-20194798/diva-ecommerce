import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AddressesRepository } from './address.repository';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepo: AddressesRepository) {}

  async findAll(userId: string) {
    return this.addressesRepo.findAllByUser(userId);
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressesRepo.findOneByIdForUser(id, userId);
    if (!address) {
      throw new NotFoundException(`Address "${id}" was not found.`);
    }
    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    const existingCount = await this.addressesRepo.countByUser(userId);
    const isFirstAddress = existingCount === 0;
    const nextIsDefault = isFirstAddress || dto.isDefault === true;

    if (nextIsDefault) {
      await this.addressesRepo.unsetDefaultForUser(userId);
    }

    return this.addressesRepo.create({
      userId,
      line1: dto.line1,
      line2: dto.line2,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
      isDefault: nextIsDefault,
    });
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    await this.findOne(id, userId);

    if (dto.isDefault === true) {
      await this.addressesRepo.unsetDefaultForUser(userId);
    }

    const updateData: Partial<{
      line1: string;
      line2: string | null;
      city: string;
      state: string | null;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }> = {
      ...(dto.line1 !== undefined ? { line1: dto.line1 } : {}),
      ...(dto.line2 !== undefined ? { line2: dto.line2 } : {}),
      ...(dto.city !== undefined ? { city: dto.city } : {}),
      ...(dto.state !== undefined ? { state: dto.state } : {}),
      ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
    };

    return this.addressesRepo.update(id, updateData);
  }

  async setDefault(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.addressesRepo.unsetDefaultForUser(userId);
    return this.addressesRepo.update(id, { isDefault: true });
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    const otherAddressesCount = await this.addressesRepo.countOtherAddresses(
      userId,
      id,
    );

    if (address.isDefault && otherAddressesCount > 0) {
      throw new UnprocessableEntityException(
        'Cannot delete default address while other addresses exist.',
      );
    }

    const linkedOrdersCount =
      await this.addressesRepo.countOrdersUsingAddress(id);
    if (linkedOrdersCount > 0) {
      throw new UnprocessableEntityException(
        'Cannot delete address linked to existing orders.',
      );
    }

    await this.addressesRepo.remove(id);
    return { message: `Address "${id}" deleted successfully.` };
  }
}
