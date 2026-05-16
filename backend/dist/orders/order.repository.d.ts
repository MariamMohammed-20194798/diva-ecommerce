import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { OrdersQueryDto, OrderStatusEnum } from './dto/order.dto';
export declare class OrdersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(userId: string, query: OrdersQueryDto): Promise<{
        data: ({
            _count: {
                items: number;
            };
            items: {
                id: string;
                quantity: number;
                variant: {
                    product: {
                        name: string;
                        slug: string;
                    };
                    size: string | null;
                    color: string | null;
                    images: string[];
                };
                unitPrice: Prisma.Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            addressId: string;
            trackingNumber: string | null;
            totalAmount: Prisma.Decimal;
            stripePaymentId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    }>;
    findOne(orderId: string, userId?: string): Promise<({
        address: {
            id: string;
            userId: string;
            state: string | null;
            line1: string;
            line2: string | null;
            city: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        };
        items: ({
            variant: {
                product: {
                    name: string;
                    id: string;
                    slug: string;
                };
            } & {
                id: string;
                size: string | null;
                color: string | null;
                sku: string;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
                productId: string;
            };
        } & {
            id: string;
            variantId: string;
            quantity: number;
            customization: Prisma.JsonValue | null;
            unitPrice: Prisma.Decimal;
            orderId: string;
        })[];
        payments: {
            id: string;
            status: string;
            stripePaymentId: string;
            amount: Prisma.Decimal;
            currency: string;
            paidAt: Date | null;
        }[];
        discounts: ({
            discount: {
                code: string;
                value: Prisma.Decimal;
                type: import("@prisma/client").$Enums.DiscountType;
            };
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            appliedAmount: Prisma.Decimal;
            discountId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        addressId: string;
        trackingNumber: string | null;
        totalAmount: Prisma.Decimal;
        stripePaymentId: string | null;
    }) | null>;
    updateStatus(orderId: string, status: OrderStatusEnum, trackingNumber?: string): Promise<{
        address: {
            id: string;
            userId: string;
            state: string | null;
            line1: string;
            line2: string | null;
            city: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        };
        items: ({
            variant: {
                product: {
                    name: string;
                    id: string;
                    slug: string;
                };
            } & {
                id: string;
                size: string | null;
                color: string | null;
                sku: string;
                priceOverride: Prisma.Decimal | null;
                stockQuantity: number;
                images: string[];
                productId: string;
            };
        } & {
            id: string;
            variantId: string;
            quantity: number;
            customization: Prisma.JsonValue | null;
            unitPrice: Prisma.Decimal;
            orderId: string;
        })[];
        payments: {
            id: string;
            status: string;
            stripePaymentId: string;
            amount: Prisma.Decimal;
            currency: string;
            paidAt: Date | null;
        }[];
        discounts: ({
            discount: {
                code: string;
                value: Prisma.Decimal;
                type: import("@prisma/client").$Enums.DiscountType;
            };
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            appliedAmount: Prisma.Decimal;
            discountId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        addressId: string;
        trackingNumber: string | null;
        totalAmount: Prisma.Decimal;
        stripePaymentId: string | null;
    }>;
    findById(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        addressId: string;
        trackingNumber: string | null;
        totalAmount: Prisma.Decimal;
        stripePaymentId: string | null;
    } | null>;
}
