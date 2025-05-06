import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateProductInOrderDto {
  @ApiProperty({
    example: '7701234567890',
    description: 'International Article Number (EAN) of the product',
  })
  @IsString()
  EAN: string;

  @ApiProperty({
    example: 3,
    description: 'Number of units requested for the product',
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: '000000010000257003',
    description: 'SKU of the material in the SAP system',
  })
  @IsString()
  SKUSAP: string;

  @ApiProperty({
    example: '0082088196',
    description: 'ID of the entry in the SAP system',
  })
  @IsString()
  ENTSAP: string;
}

export class CreateOrderDto {
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for the order',
  })
  @IsString()
  PEDSAP: string;

  @ApiProperty({
    example: '000123',
    description: 'Identifier for the processing wave the order belongs to',
  })
  @IsString()
  wave: string;

  @ApiProperty({
    example: '10004',
    description: 'Location code where the order will be processed or picked',
  })
  @IsString()
  location: string;

  @ApiProperty({
    example: 0,
    description:
      'Status for order  0 - Not assigned, 1 - Assigned 2 - In process, 3 - Completed',
  })
  @IsString()
  status?: number;

  @ApiProperty({
    type: [CreateProductInOrderDto],
    description: 'List of products included in the order',
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
