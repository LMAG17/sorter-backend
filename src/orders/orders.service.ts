import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EslService } from 'src/esl/esl.service';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { AssignOrderDto } from './dto/assign-order.dto';
import { AssignProductForPickingDto } from './dto/assign-product.dto';

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

  async assign(
    orderId: number,
    assignOrderDto: AssignOrderDto,
  ): Promise<Order> {
    const { orderState, location } = assignOrderDto;

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['products'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = orderState;
    order.location = location;

    const updatedOrder = await this.ordersRepository.save(order);

    const ordernedProducts = order.products.sort((a, b) =>
      a.EAN.localeCompare(b.EAN),
    );

    await this.eslService.updateLocation(location, 'orderID', order.id);
    await this.eslService.updateLocation(
      location,
      'productEAN',
      ordernedProducts[0].EAN,
    );
    await this.eslService.updateLocation(
      location,
      'productQuantity',
      ordernedProducts[0].quantity,
    );

    return updatedOrder;
  }

  async assignProducForPicking(
    orderId: number,
    assignProductForPickingDto: AssignProductForPickingDto,
  ) {
    try {
      const { productEAN } = assignProductForPickingDto;
      const order = await this.ordersRepository.findOne({
        where: { id: orderId },
        relations: ['products'],
      });
      if (!order) {
        throw new Error('Order not found');
      }
      const product = order.products.find((p) => p.EAN === productEAN);
      if (!product) {
        throw new Error('Product not found in order');
      }
      const { EAN, quantity } = product;
      await this.eslService.updateLocation(order.location, 'productEAN', EAN);
      await this.eslService.updateLocation(
        order.location,
        'productQuantity',
        quantity,
      );
      return product;
    } catch (error) {
      console.error('Error assigning product for picking:', error);
      throw error;
    }
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
