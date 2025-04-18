import { IsInt, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  productEAN: string;

  @IsString()
  orderID: string;

  @IsInt()
  productQuantity: number;
}