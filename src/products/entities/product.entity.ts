import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    example: 'Lenceria XS',
    description: 'The name of the product.',
  })
  @Column()
  name: string;
  @ApiProperty({
    example: '123456789',
    description: 'A EAN identificator of the product.',
  })
  @Column()
  EAN: string;
  @ApiProperty({
    example: 10,
    description: 'The amount of products to be packed.',
  })
  @Column()
  quantity: number;
  @ManyToMany(() => Order, (order) => order.products, { nullable: true })
  orders: Order[];
}
