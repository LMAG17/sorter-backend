import { ApiProperty } from '@nestjs/swagger';
import { OrderProductResponseDto } from './order-product-response.dto';

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  wave: string;

  @ApiProperty()
  location: string;

  @ApiProperty({
    type: [OrderProductResponseDto],
  })
  orderProducts: OrderProductResponseDto[];
}
