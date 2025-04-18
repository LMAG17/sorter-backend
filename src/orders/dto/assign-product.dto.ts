import { IsInt, IsString } from 'class-validator';

export class AssignProductForPickingDto {
  @IsString()
  productEAN: string;
}
