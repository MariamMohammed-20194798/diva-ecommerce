import { AddressesRepository } from './address.repository';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
export declare class AddressesService {
    private readonly addressesRepo;
    constructor(addressesRepo: AddressesRepository);
    findAll(userId: string): Promise<{
        id: string;
        userId: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }>;
    create(userId: string, dto: CreateAddressDto): Promise<{
        id: string;
        userId: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }>;
    update(id: string, userId: string, dto: UpdateAddressDto): Promise<{
        id: string;
        userId: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }>;
    setDefault(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
