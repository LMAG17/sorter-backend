import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the location entry',
  })
  @IsInt()
  id: number;

  @ApiProperty({
    example: 'Ubicacion 1',
    description: 'Human-readable name or label of the location',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '7701234567890',
    description: 'EAN code of the product assigned to this location',
  })
  @IsString()
  productEAN: string;

  @ApiProperty({
    example: 'order-001',
    description: 'Order identifier associated with this product location',
  })
  @IsString()
  orderID: string;

  @ApiProperty({
    example: 10,
    description:
      'Quantity of the product assigned to this location for the given order',
  })
  @IsInt()
  productQuantity: number;
}
