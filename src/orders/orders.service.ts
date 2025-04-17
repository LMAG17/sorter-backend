import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EslService } from 'src/esl/esl.service';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly eslService: EslService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { wave, location, products: incomingProducts } = createOrderDto;

    const existingProducts = await this.productRepository.findBy({
      EAN: In(incomingProducts.map((p) => p.EAN)),
    });

    const existingEANs = new Set(existingProducts.map((p) => p.EAN));

    const newProductsData = incomingProducts.filter(
      (p) => !existingEANs.has(p.EAN),
    );

    const newProducts = this.productRepository.create(newProductsData);
    await this.productRepository.save(newProducts);

    const allProducts = [...existingProducts, ...newProducts];

    const order = this.ordersRepository.create({
      wave,
      location,
      products: allProducts,
    });

    return this.ordersRepository.save(order);
  }

  async findAll() {
    return await this.ordersRepository.find({
      relations: ['products'],
    });
  }

  async findOne(id: number) {
    return await this.ordersRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.ordersRepository.update(id, updateOrderDto);
  }

  remove(id: number) {
    return this.ordersRepository.delete(id);
  }
}
