import { IsNumber, IsString } from "class-validator";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  EAN: string;

  @IsNumber()
  quantity: number;
}
