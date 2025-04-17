import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  wave: string;
  @Column({ nullable: true })
  location: string;
  @ManyToMany(() => Product, (product) => product.orders, { nullable: true })
  @JoinTable()
  products: Product[];
}
