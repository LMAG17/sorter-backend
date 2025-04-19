import { Injectable } from '@nestjs/common';
import { CreateOrderGroupDto } from './dto/create-order-group.dto';
import { UpdateOrderGroupDto } from './dto/update-order-group.dto';

@Injectable()
export class OrderGroupsService {
  create(createOrderGroupDto: CreateOrderGroupDto) {
    return 'This action adds a new orderGroup';
  }

  findAll() {
    return `This action returns all orderGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderGroup`;
  }

  update(id: number, updateOrderGroupDto: UpdateOrderGroupDto) {
    return `This action updates a #${id} orderGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderGroup`;
  }
}
