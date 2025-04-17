import { Module } from '@nestjs/common';
import { EslModule } from 'src/esl/esl.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [EslModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
