import { forwardRef, Module } from '@nestjs/common';
import { EslModule } from 'src/esl/esl.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ProductsModule } from 'src/products/products.module';
import { Product } from 'src/products/entities/product.entity';
import { SapModule } from 'src/sap/sap.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product]),
    forwardRef(() => ProductsModule),
    EslModule,
    SapModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
