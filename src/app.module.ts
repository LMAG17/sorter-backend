import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { EslService } from './esl/esl.service';
import { EslModule } from './esl/esl.module';
import { HttpModule } from '@nestjs/axios';
import { ProductsModule } from './products/products.module';
import { OrderGroupsModule } from './order-groups/order-groups.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { SapModule } from './sap/sap.module';
import { SapService } from './sap/sap.service';
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    EslModule,
    OrdersModule,
    ProductsModule,
    OrderGroupsModule,
    SapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
