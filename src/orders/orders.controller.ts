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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @ApiOperation({
    summary: 'This endpoint creates an order in database.',
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: [OrderResponseDto],
  })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @ApiOperation({
    summary: 'This endpoint assigns an order to a location.',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully assigned.',
    type: AssignOrderDto,
  })
  @Post(':id/assign-location')
  assign(@Param('id') id: number, @Body() assignOrderDto: AssignOrderDto) {
    return this.ordersService.assign(id, assignOrderDto);
  }

  @ApiOperation({
    summary: 'This endpoint assigns a product to an order for picking.',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully assigned for picking.',
    type: AssignProductForPickingDto,
  })
  @Post(':id/assign-product-picking')
  assignProducForPicking(
    @Param('id') id: number,
    @Body() assignProductForPickingDto: AssignProductForPickingDto,
  ) {
    return this.ordersService.assignProducForPicking(
      id,
      assignProductForPickingDto,
    );
  }

  @ApiOperation({
    summary:
      'This endpoint reduces the picked quantity of an assigned product.',
  })
  @ApiResponse({
    status: 200,
    description: 'The picked quantity has been successfully reduced.',
  })
  @Post(':id/assigned-product-reduce-picked-quantity')
  assignedProductReducePickedQuantity(@Param('id') id: number) {
    return this.ordersService.assignedProductReducePickedQuantity(id);
  }

  @ApiOperation({
    summary:
      'This endpoint reduces the picked quantity of an assigned product.',
  })
  @ApiResponse({
    status: 200,
    description: 'The picked quantity has been successfully increased.',
  })
  @Post(':id/assigned-product-increase-picked-quantity')
  assignedProductIncreasePickedQuantity(@Param('id') id: number) {
    return this.ordersService.assignedProductIncreasePickedQuantity(id);
  }
  
  @ApiOperation({
    summary: 'This endpoint returns all orders in database.',
  })
  @ApiResponse({
    status: 200,
    description: 'The records have been successfully fetched.',
    type: [OrderResponseDto],
  })
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @ApiOperation({
    summary: 'This endpoint returns an order by ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully fetched.',
    type: CreateOrderDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @ApiOperation({
    summary: 'This endpoint updates an order by ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @ApiOperation({
    summary: 'This endpoint deletes an order by ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
