import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProductInOrderDto {
  @ApiProperty({
    required: false,
    example: 'Shampoo Anticaspa',
    description: 'Name of the product being ordered',
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: '7701234567890',
    description: 'International Article Number (EAN) of the product',
  })
  @IsString()
  EAN: string;

  @ApiProperty({
    required: false,
    example: 3,
    description: 'Number of units requested for the product',
  })
  @IsNumber()
  quantity: number;
}
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    required: false,
    example: 'wave-001',
    description: 'Identifier for the processing wave the order belongs to',
  })
  @IsString()
  wave: string;

  @ApiProperty({
    required: false,
    example: 'warehouse-A1',
    description: 'Location code where the order will be processed or picked',
  })
  @IsString()
  location: string;

  @ApiProperty({
    type: [CreateProductInOrderDto],
    description: 'List of products included in the order',
    required: false,
    example: [
      {
        name: 'Shampoo Anticaspa',
        EAN: '7701234567890',
        quantity: 3,
      },
      {
        name: 'Jabón Líquido Manos',
        EAN: '7700987654321',
        quantity: 5,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductInOrderDto)
  products: CreateProductInOrderDto[];
}
