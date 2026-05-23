import * as common from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { CheckoutService } from './checkout.service';
import { ConfirmPaymentDto, CreatePaymentIntentDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { SWAGGER_BEARER_NAME } from '../common/swagger/swagger.config';
import { ApiProtectedEndpointErrors } from '../common/swagger/api-responses';

@ApiTags('Payments')
@common.Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  private getAuthUserId(req: Request) {
    const user = req as unknown as { user?: { sub?: string; id?: string } };
    return user.user?.sub ?? user.user?.id;
  }

  @common.Post('intent')
  @common.UseGuards(JwtAuthGuard)
  @common.HttpCode(common.HttpStatus.CREATED)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({
    summary: 'Create Stripe PaymentIntent',
    description:
      'Server-side total is always recalculated — never trust the frontend total. ' +
      'Validates stock, applies discount code if provided, then creates a ' +
      'Stripe PaymentIntent. Returns the client_secret for use with Stripe Elements. ' +
      'Requires authentication.',
  })
  @ApiCreatedResponse({
    description:
      'Returns clientSecret, subtotal, discount, and total (all in cents)',
    schema: {
      example: {
        clientSecret: 'pi_3Qexample_secret_abc',
        paymentIntentId: 'pi_3QexampleStripePaymentIntentId',
        subtotal: 5998,
        discount: 500,
        total: 5498,
        currency: 'eur',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Empty cart, invalid address, or invalid discount code',
  })
  @ApiProtectedEndpointErrors()
  @ApiQuery({
    name: 'autoCreateOrder',
    required: false,
    type: Boolean,
    description:
      'Testing only: if true, creates order immediately from the PaymentIntent without waiting for Stripe webhook.',
  })
  @ApiBody({
    type: CreatePaymentIntentDto,
    examples: {
      default: {
        summary: 'Checkout with saved address',
        value: {
          addressId: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
      withDiscount: {
        summary: 'Checkout with discount code',
        value: {
          addressId: '550e8400-e29b-41d4-a716-446655440001',
          discountCode: 'SUMMER20',
        },
      },
    },
  })
  async createIntent(
    @common.Body() dto: CreatePaymentIntentDto,
    @common.Req() req: Request,
    @common.Query('autoCreateOrder') autoCreateOrder?: string,
  ) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new common.UnauthorizedException('Missing authenticated user id.');
    }
    return this.checkoutService.createPaymentIntent(
      userId,
      dto,
      autoCreateOrder === 'true',
    );
  }

  @common.Post('confirm')
  @common.UseGuards(JwtAuthGuard)
  @common.HttpCode(common.HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({
    summary: 'Finalize a successful Stripe payment',
    description:
      'Fetches a Stripe PaymentIntent after client-side confirmation, verifies that it belongs to the authenticated user, and creates the order if payment succeeded.',
  })
  @ApiOkResponse({
    description:
      'Returns confirmation status and the created order id when available',
    schema: {
      example: {
        status: 'succeeded',
        orderId: '550e8400-e29b-41d4-a716-446655440099',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Payment is not successful yet or does not belong to the user',
  })
  @ApiProtectedEndpointErrors()
  @ApiBody({
    type: ConfirmPaymentDto,
    examples: {
      default: {
        summary: 'Confirm PaymentIntent after Stripe Elements',
        value: { paymentIntentId: 'pi_3QexampleStripePaymentIntentId' },
      },
    },
  })
  async confirmPayment(
    @common.Body() dto: ConfirmPaymentDto,
    @common.Req() req: Request,
  ) {
    const userId = this.getAuthUserId(req);
    if (!userId) {
      throw new common.UnauthorizedException('Missing authenticated user id.');
    }

    return this.checkoutService.confirmPayment(userId, dto.paymentIntentId);
  }

  @common.Post('webhook')
  @common.HttpCode(common.HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook receiver',
    description:
      'Receives events from Stripe. Verifies the webhook signature using ' +
      'STRIPE_WEBHOOK_SECRET. On payment_intent.succeeded, atomically creates ' +
      'the order. This endpoint must receive the raw request body — do not ' +
      'apply JSON body-parser middleware to this route.',
  })
  @ApiOkResponse({ description: '{ received: true }' })
  @ApiBadRequestResponse({ description: 'Invalid Stripe signature' })
  async webhook(
    @common.Req() req: common.RawBodyRequest<Request>,
    @common.Headers('stripe-signature') signature: string,
  ) {
    return this.checkoutService.handleWebhook(req.rawBody!, signature);
  }
}
