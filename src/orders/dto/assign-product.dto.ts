import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class AssignProductForPickingDto {
  @ApiProperty({
    example: '7701234567890',
    description:
      'International Article Number (EAN) of the product to show in the ESL label',
  })
  @IsString()
  productEAN: string;
}
