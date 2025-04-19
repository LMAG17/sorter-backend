import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @ApiProperty({
    example: 'Lenceria XS',
    description: 'The name of the product.',
  })
  name: string;

  @ApiProperty({
    example: '123456789',
    description: 'International Article Number (EAN) of the product.',
  })
  @IsString()
  EAN: string;
  @ApiProperty({
    example: 10,
    description: 'The amount of products to be packed.',
  })
  @IsNumber()
  quantity: number;
}
