import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ example: 'Nuevo nombre del producto', required: false })
  name?: string;

  @ApiProperty({ example: '123456789', required: false })
  EAN?: string;

  @ApiProperty({ example: 10, required: false })
  quantity?: number;
}
