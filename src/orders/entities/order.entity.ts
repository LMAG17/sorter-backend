import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderProduct } from './order-product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  status: number;

  @Column()
  wave: string;

  @Column({ nullable: true })
  location: string;

  @OneToMany(() => OrderProduct, (op) => op.order, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  orderProducts: OrderProduct[];
}
