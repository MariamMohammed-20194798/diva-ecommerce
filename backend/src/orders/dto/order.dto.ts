import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class OrdersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: OrderStatusEnum })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatusEnum, example: 'SHIPPED' })
  @IsEnum(OrderStatusEnum)
  status!: OrderStatusEnum;

  @ApiPropertyOptional({
    description: 'Optional tracking number shown in the shipping email',
    example: 'DHL-123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Optional internal note for this status change',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
