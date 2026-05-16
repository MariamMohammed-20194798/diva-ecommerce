import type { Queue } from 'bull';
import { OrdersRepository } from './order.repository';
import { OrdersQueryDto, UpdateOrderStatusDto } from './dto/order.dto';
export declare class OrdersService {
    private readonly ordersRepo;
    private readonly emailQueue;
    private readonly logger;
    constructor(ordersRepo: OrdersRepository, emailQueue: Queue);
    findAll(userId: string, query: OrdersQueryDto): Promise<{
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
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            addressId: string;
            trackingNumber: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
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
    findOne(orderId: string, userId: string): Promise<{
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
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                stockQuantity: number;
                images: string[];
                productId: string;
            };
        } & {
            id: string;
            variantId: string;
            quantity: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        payments: {
            id: string;
            status: string;
            stripePaymentId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            paidAt: Date | null;
        }[];
        discounts: ({
            discount: {
                code: string;
                value: import("@prisma/client/runtime/library").Decimal;
                type: import("@prisma/client").$Enums.DiscountType;
            };
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            appliedAmount: import("@prisma/client/runtime/library").Decimal;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        stripePaymentId: string | null;
    }>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<{
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
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                stockQuantity: number;
                images: string[];
                productId: string;
            };
        } & {
            id: string;
            variantId: string;
            quantity: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        payments: {
            id: string;
            status: string;
            stripePaymentId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            paidAt: Date | null;
        }[];
        discounts: ({
            discount: {
                code: string;
                value: import("@prisma/client/runtime/library").Decimal;
                type: import("@prisma/client").$Enums.DiscountType;
            };
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            appliedAmount: import("@prisma/client/runtime/library").Decimal;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        stripePaymentId: string | null;
    }>;
    private sendStatusEmail;
}
