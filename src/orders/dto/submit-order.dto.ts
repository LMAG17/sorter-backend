import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SubmitOrderDto {
  @ApiProperty({
    example: true,
    description: 'Is the last box of the order',
  })
  @IsBoolean()
  isLastBox: boolean;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the person who submitted the order',
  })
  @IsString()
  @IsOptional()
  name?: string;
}
