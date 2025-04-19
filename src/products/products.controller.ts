import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'This endpoint creates a product in database.' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: CreateProductDto,
  })
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'This endpoint returns all products in database.' })
  @ApiResponse({
    status: 200,
    description: 'The records have been successfully fetched.',
    type: [CreateProductDto],
  })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
  @ApiOperation({ summary: 'This endpoint returns a product by ID.' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully fetched.',
    type: CreateProductDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }
  @ApiOperation({ summary: 'This endpoint updates a product by ID.' })
  @ApiResponse({
    status: 200,
    description: 'The record  has been successfully updated.',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @ApiOperation({ summary: 'This endpoint deletes a product by ID.' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
