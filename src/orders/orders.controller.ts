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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderResponseDto } from './dto/order-response.dto';
import { SubmitProductQuantityDto } from './dto/submit-product-quantity.dto';
import { SubmitOrderDto } from './dto/submit-order.dto';

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
    summary: 'This will return all orders from DATABASE',
  })
  @ApiResponse({
    status: 200,
    description: 'This will return all orders from DATABASE',
  })
  @Post('classic')
  getOrders() {
    return this.ordersService.findAll();
  }

  @ApiOperation({
    summary: 'This endpoint returns all orders in SAP and DATABASE.',
  })
  @ApiResponse({
    status: 200,
    description: 'The records have been successfully fetched.',
    type: [OrderResponseDto],
  })
  @Get()
  findAll() {
    return this.ordersService.findAllWithSap();
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

  @ApiOperation({
    summary: 'This will submit a complete for current Product',
    description: 'This will submit a complete for current Product',
  })
  @ApiResponse({
    status: 200,
    description: 'This product is complete of picking',
  })
  @Post(':id/submit-product-complete')
  submitProductQuantity(
    @Param('id') id: string,
    @Body() submitProductDto: SubmitProductQuantityDto,
  ) {
    return this.ordersService.submitProductQuantity(+id, submitProductDto);
  }

  @ApiOperation({
    summary: 'This will submit a complete for order',
  })
  @ApiResponse({
    status: 200,
    description: 'This product is complete of picking',
  })
  @Post(':id/submit-order-complete')
  submitOrderComplete(
    @Param('id') id: string,
    @Body() submitOrderDto: SubmitOrderDto,
  ) {
    return this.ordersService.submitOrderComplete(+id, submitOrderDto);
  }

  @ApiOperation({
    summary: 'This will get the barcoded product',
  })
  @ApiResponse({
    status: 200,
    description: 'This will update all the labels for the product',
  })
  @Get('scan/:scannedString')
  getBarcodedProduct(@Param('scannedString') scannedString: string) {
    return this.ordersService.onBarcodeScanned(scannedString);
  }

  @ApiOperation({
    summary: 'This will return all the orders grouped by wave',
  })
  @ApiResponse({
    status: 200,
    description: 'This will return all the orders grouped by wave',
  })
  @Post('grouped-by-wave')
  getOrdersByWave() {
    return this.ordersService.getOrdersGroupedByWave();
  }

  @ApiOperation({
    summary: 'This will return the orders by wave',
  })
  @ApiResponse({
    status: 200,
    description: 'This will return the orders by wave',
  })
  @Post('orders-by-wave/:id')
  getOrdersByWaveId(@Param('id') id: string) {
    return this.ordersService.getOrdersByWave(id);
  }

  @ApiOperation({
    summary: 'This will return the order by PEDSAP',
  })
  @ApiResponse({
    status: 200,
    description: 'This will return the order by PEDSAP',
  })
  @Post('order-by-pedsap/:PEDSAP')
  getWaveByPEDSAP(@Param('PEDSAP') PEDSAP: string) {
    return this.ordersService.getOrderByPEDSAP(PEDSAP);
  }

  @ApiOperation({
    summary: 'This will clear the orders in the database',
  })
  @ApiResponse({
    status: 200,
    description: 'This will clear the orders in the database',
  })
  @Post('clear')
  clearOrders() {
    return this.ordersService.clearOrders();
  }
}
