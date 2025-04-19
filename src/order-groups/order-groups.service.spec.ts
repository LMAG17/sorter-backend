import { Test, TestingModule } from '@nestjs/testing';
import { OrderGroupsService } from './order-groups.service';

describe('OrderGroupsService', () => {
  let service: OrderGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderGroupsService],
    }).compile();

    service = module.get<OrderGroupsService>(OrderGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
