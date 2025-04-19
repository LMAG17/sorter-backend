import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  EAN: string;
}

export class OrderProductResponseDto {
  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty()
  quantity: number;
}
