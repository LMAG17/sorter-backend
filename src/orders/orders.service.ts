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

    const existingEANMap = new Map(existingProducts.map((p) => [p.EAN, p]));

    const newProductsData = incomingProducts.filter(
      (p) => !existingEANMap.has(p.EAN),
    );

    const newProducts = this.productRepository.create(newProductsData);
    await this.productRepository.save(newProducts);

    const allProducts = [...existingProducts, ...newProducts];
    const productMap = new Map(allProducts.map((p) => [p.EAN, p]));

    const orderProducts = incomingProducts.map((p) => ({
      product: productMap.get(p.EAN),
      quantity: p.quantity,
      pickedQuantity: p.quantity,
    }));

    const order = this.ordersRepository.create({
      wave,
      location,
      orderProducts,
    });

    return this.ordersRepository.save(order);
  }

  async assign(
    orderId: number,
    assignOrderDto: AssignOrderDto,
  ): Promise<Order> {
    const { location } = assignOrderDto;

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = 1;
    order.location = location;

    const updatedOrder = await this.ordersRepository.save(order);

    await this.eslService.updateLocation(location, 'orderID', order.id);
    await this.eslService.updateLocation(
      location,
      'productEAN',
      updatedOrder.orderProducts[0].product.EAN,
    );
    await this.eslService.updateLocation(
      location,
      'productQuantity',
      updatedOrder.orderProducts[0].quantity,
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
      });
      if (!order) {
        throw new Error('Order not found');
      }
      const orderProduct = order.orderProducts.find(
        (p) => p.product.EAN === productEAN,
      );
      if (!orderProduct) {
        throw new Error('Product not found in order');
      }

      await this.eslService.updateLocation(
        order.location,
        'productEAN',
        orderProduct.product.EAN,
      );
      await this.eslService.updateLocation(
        order.location,
        'productQuantity',
        orderProduct.quantity,
      );
      return orderProduct;
    } catch (error) {
      console.error('Error assigning product for picking:', error);
      throw error;
    }
  }

  async assignedProductReducePickedQuantity(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const location = await this.eslService.getLocationById(order.location);
    if (!location) {
      throw new Error('Location not assigned');
    }
    const assignedProduct = order.orderProducts.find(
      (p) => p.product.EAN === location.productEAN,
    );
    if (!assignedProduct) {
      throw new Error('Assigned product not found');
    }
    if (assignedProduct.pickedQuantity > 0) {
      assignedProduct.pickedQuantity--;
    } else {
      throw new Error('Picked quantity cannot be less than 0');
    }

    return await this.ordersRepository.save(order);
  }

  async assignedProductIncreasePickedQuantity(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }
    const location = await this.eslService.getLocationById(order.location);
    if (!location) {
      throw new Error('Location not assigned');
    }
    const assignedProduct = order.orderProducts.find(
      (p) => p.product.EAN === location.productEAN,
    );
    if (!assignedProduct) {
      throw new Error('Assigned product not found');
    }
    if (assignedProduct.pickedQuantity < assignedProduct.quantity) {
      assignedProduct.pickedQuantity++;
    } else {
      throw new Error(
        'Picked quantity cannot be greater than the total quantity',
      );
    }

    return await this.ordersRepository.save(order);
  }

  async findAll() {
    return await this.ordersRepository.find();
  }

  async findOne(id: number) {
    return await this.ordersRepository.findOne({
      where: { id },
    });
  }
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = updateOrderDto.status ?? order.status;
    order.location = updateOrderDto.location ?? order.location;
    order.wave = updateOrderDto.wave ?? order.wave;
    if (updateOrderDto?.orderProducts.length > 0) {
      for (const product of updateOrderDto.orderProducts) {
        const existingProduct = order.orderProducts.find(
          (p) => p.product.EAN === product.product.EAN,
        );
        if (existingProduct) {
          existingProduct.quantity = product.quantity;
        }
      }
    }

    return await this.ordersRepository.save(order);
  }

  remove(id: number) {
    return this.ordersRepository.delete(id);
  }
}
