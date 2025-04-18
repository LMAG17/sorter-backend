import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { AssignProductForPickingDto } from './dto/assign-product.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: number, @Body() assignOrderDto: AssignOrderDto) {
    return this.ordersService.assign(id, assignOrderDto);
  }

  @Post(':id/assing-product-picking')
  assignProducForPicking(
    @Param('id') id: number,
    @Body() assignProductForPickingDto: AssignProductForPickingDto,
  ) {
    return this.ordersService.assignProducForPicking(id, assignProductForPickingDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
