import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class SubmitProductQuantityDto {
  @ApiProperty({
    example: '7701234567890',
    description:
      'International Article Number (EAN) of the product to show in the ESL label',
  })
  @IsString()
  productEAN: string;

  @ApiProperty({
    example: 10,
    description: 'Quantity of the product to be submitted',
  })
  @IsInt()
  quantity: number;
}
