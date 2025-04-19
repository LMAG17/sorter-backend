import { Module } from '@nestjs/common';
import { OrderGroupsService } from './order-groups.service';
import { OrderGroupsController } from './order-groups.controller';

@Module({
  controllers: [OrderGroupsController],
  providers: [OrderGroupsService],
})
export class OrderGroupsModule {}
