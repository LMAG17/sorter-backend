import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SubmitOrderDto {
  @ApiProperty({
    example: true,
    description: 'Is the last box of the order',
  })
  @IsBoolean()
  isLastBox: boolean;
}
