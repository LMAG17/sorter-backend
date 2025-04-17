import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { EslService } from './esl/esl.service';
import { EslModule } from './esl/esl.module';
import { HttpModule } from '@nestjs/axios';
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
  ],
  controllers: [AppController],
  providers: [AppService, EslService],
})
export class AppModule {}
