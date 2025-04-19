import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignOrderDto {
  @ApiProperty({
    required: false,
    example: 'Picking',
    description: 'The new state of the order',
  })
  @IsString()
  orderState: string;

  @ApiProperty({
    required: false,
    example: 'wave-001',
    description:
      'The location code where the order will be processed or picked',
  })
  @IsString()
  location: string;
}
