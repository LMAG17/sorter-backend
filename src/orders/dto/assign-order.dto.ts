import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignOrderDto {
  @ApiProperty({
    required: false,
    example: '1',
    description:
      'The location code where the order will be processed or picked',
  })
  @IsString()
  location: string;
}
