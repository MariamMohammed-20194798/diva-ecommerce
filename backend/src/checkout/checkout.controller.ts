import * as common from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { CheckoutService } from './checkout.service';
import { ConfirmPaymentDto, CreatePaymentIntentDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@ApiTags('checkout')
@common.Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  private getAuthUserId(req: Request) {
    const user = req as unknown as { user?: { sub?: string; id?: string } };
    return user.user?.sub ?? user.user?.id;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /checkout/intent
  //
  // Protected — user must be logged in.
  // Validates the cart, recalculates total server-side, applies any discount,
  // then creates a Stripe PaymentIntent and returns the client_secret to the
  // frontend so it can render Stripe Elements and complete payment.
  // ─────────────────────────────────────────────────────────────────────────────

  @common.Post('intent')
  @common.UseGuards(JwtAuthGuard)
  @common.HttpCode(common.HttpStatus.CREATED)
  @ApiBearerAuth()
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
  })
  @ApiBadRequestResponse({
    description: 'Empty cart, invalid address, or invalid discount code',
  })
  @ApiQuery({
    name: 'autoCreateOrder',
    required: false,
    type: Boolean,
    description:
      'Testing only: if true, creates order immediately from the PaymentIntent without waiting for Stripe webhook.',
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Finalize a successful Stripe payment',
    description:
      'Fetches a Stripe PaymentIntent after client-side confirmation, verifies that it belongs to the authenticated user, and creates the order if payment succeeded.',
  })
  @ApiOkResponse({
    description:
      'Returns confirmation status and the created order id when available',
  })
  @ApiBadRequestResponse({
    description: 'Payment is not successful yet or does not belong to the user',
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

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /checkout/webhook
  //
  // Public — called by Stripe, NOT by your frontend.
  // Stripe signature is verified inside the service using the raw body.
  //
  // IMPORTANT: This route must receive the raw request body (Buffer), not the
  // parsed JSON body. In main.ts, exclude this route from the global
  // bodyParser JSON middleware:
  //
  //   app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
  //   await app.listen(3001);
  //
  // On payment_intent.succeeded: atomically creates order, decrements stock,
  // records payment, clears cart, and applies discount usage.
  // ─────────────────────────────────────────────────────────────────────────────

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
