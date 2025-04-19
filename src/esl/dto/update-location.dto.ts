import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Unique identifier for the location entry',
  })
  @IsInt()
  id: number;

  @ApiProperty({
    required: false,
    example: 'Ubicacion 1',
    description: 'Human-readable name or label of the location',
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: '7701234567890',
    description: 'EAN code of the product assigned to this location',
  })
  @IsString()
  productEAN: string;

  @ApiProperty({
    required: false,
    example: 'order-001',
    description: 'Order identifier associated with this product location',
  })
  @IsString()
  orderID: string;

  @ApiProperty({
    required: false,
    example: 10,
    description:
      'Quantity of the product assigned to this location for the given order',
  })
  @IsInt()
  productQuantity: number;
}
