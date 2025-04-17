import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  EAN: string;
  @Column()
  quantity: number;
  @ManyToMany(() => Order, (order) => order.products, { nullable: true })
  orders: Order[];
}
