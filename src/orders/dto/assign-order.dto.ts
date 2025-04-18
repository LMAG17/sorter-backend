import { IsString } from 'class-validator';

export class AssignOrderDto {
  @IsString()
  orderState: string;

  @IsString()
  location: string;
}
