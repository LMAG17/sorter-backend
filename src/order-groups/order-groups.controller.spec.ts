import { Test, TestingModule } from '@nestjs/testing';
import { OrderGroupsController } from './order-groups.controller';
import { OrderGroupsService } from './order-groups.service';

describe('OrderGroupsController', () => {
  let controller: OrderGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderGroupsController],
      providers: [OrderGroupsService],
    }).compile();

    controller = module.get<OrderGroupsController>(OrderGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
