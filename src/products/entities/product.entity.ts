import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    example: 'Lenceria XS',
    description: 'The name of the product.',
  })
  @ApiProperty({
    example: '123456789',
    description: 'A EAN identificator of the product.',
  })
  @Column()
  EAN: string;
}
