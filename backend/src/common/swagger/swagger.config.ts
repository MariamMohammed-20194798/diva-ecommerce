import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'docs';
export const SWAGGER_BEARER_NAME = 'JWT-auth';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('DIVA Ecommerce API')
    .setDescription(
      'Professional ecommerce backend with authentication, products, cart, orders, ' +
        'payments, wishlist, reviews, AI stylist, and admin management.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description:
          'Enter JWT access token from POST /api/auth/verify-otp or POST /api/auth/refresh',
        in: 'header',
      },
      SWAGGER_BEARER_NAME,
    )
    .addTag('Auth', 'OTP login/signup, token refresh, Google OAuth')
    .addTag('Users', 'Saved shipping addresses for authenticated users')
    .addTag('Products', 'Catalog, search, and product reviews')
    .addTag('Categories', 'Category tree, listing, and category products')
    .addTag('Cart', 'Guest and authenticated shopping cart')
    .addTag('Wishlist', 'Saved products for authenticated users')
    .addTag('Orders', 'Order history and order detail')
    .addTag('Payments', 'Stripe PaymentIntent, confirmation, and webhooks')
    .addTag('Reviews', 'Product reviews (verified purchasers)')
    .addTag('Admin', 'Admin-only product, category, and order management')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'DIVA Ecommerce API',
  });
}
