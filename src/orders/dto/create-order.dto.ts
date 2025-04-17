import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProductInOrderDto {
  @IsString()
  name: string;

  @IsString()
  EAN: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  wave: string;

  @IsString()
  location: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductInOrderDto)
  products: CreateProductInOrderDto[];
}
