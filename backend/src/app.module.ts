import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolveBackendEnvFilePaths } from './config/env-path';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveBackendEnvFilePaths(),
    }),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    AddressesModule,
    ReviewsModule,
    WishlistModule,
  ],
})
export class AppModule {}
