import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignOrderDto } from './dto/assign-order.dto';
import { SapService } from 'src/sap/sap.service';
import { SubmitProductQuantityDto } from './dto/submit-product-quantity.dto';
import { SubmitOrderDto } from './dto/submit-order.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly sapService: SapService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const {
      wave,
      location,
      PEDSAP,
      status,
      products: incomingProducts,
    } = createOrderDto;

    const existingProducts =
      await this.productsService.findOneByEAN(incomingProducts);

    const existingEANMap = new Map(existingProducts.map((p) => [p.EAN, p]));

    const newProductsData = incomingProducts.filter(
      (p) => !existingEANMap.has(p.EAN),
    );

    const newProducts = await this.productsService.createMany(newProductsData);

    const allProducts = [...existingProducts, ...newProducts];
    const productMap = new Map(allProducts.map((p) => [p.EAN, p]));

    const orderProducts = incomingProducts.map((p) => ({
      product: productMap.get(p.EAN),
      quantity: p.quantity,
      pickedQuantity: 0,
      done: false,
      SKUSAP: p.SKUSAP,
      ENTSAP: p.ENTSAP,
    }));

    const order = this.ordersRepository.create({
      wave,
      location,
      PEDSAP,
      orderProducts,
      status,
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

    return updatedOrder;
  }

  async findAll() {
    return await this.ordersRepository.find();
  }

  async findAllWithSap() {
    const orders = await this.sapService.getOrders();

    const existingOrders = await this.ordersRepository.findBy({
      PEDSAP: In(orders.map((order) => order.PEDSAP)),
    });

    const existingOrdersMap = new Map(
      existingOrders.map((order) => [order.PEDSAP, order]),
    );
    const newOrders = orders.filter(
      (order) => !existingOrdersMap.has(order.PEDSAP),
    );

    for (const order of newOrders) {
      await this.create(order);
    }

    return await this.ordersRepository.find();
  }

  async findOne(id: number) {
    return await this.ordersRepository.findOne({
      where: { id },
      relations: ['orderProducts', 'orderProducts.product'],
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
          (p) => p.product?.EAN === product.product?.EAN,
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

  async submitProductQuantity(
    orderId: number,
    product: SubmitProductQuantityDto,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts', 'orderProducts.product'],
    });
    if (!order) {
      throw new Error('Order not found');
    }

    const orderProductIndex = order.orderProducts.findIndex(
      (p) => p.product.EAN === product.productEAN,
    );

    const orderProduct = order.orderProducts[orderProductIndex];

    if (!orderProduct) {
      throw new Error('Product not found in order');
    }

    if (product.quantity < 0 || product.quantity > orderProduct.quantity) {
      throw new Error(
        'Invalid quantity. Quantity must be greater than 0 and less than or equal to the total quantity.',
      );
    }
    order.currentProductEAN = '';
    order.currentProductQuantity = 0;
    order.orderProducts[orderProductIndex].pickedQuantity = product.quantity;
    order.orderProducts[orderProductIndex].done = true;

    return await this.ordersRepository.save(order);
  }

  async submitOrderComplete(orderID: number, submitOrderDto: SubmitOrderDto) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderID },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.PEDSAP === null || order.PEDSAP === undefined) {
      throw new Error('Order not assigned to SAP');
    }

    const productsToSend = await Promise.all(
      order.orderProducts.filter((prd) =>
        submitOrderDto.isLastBox
          ? prd.pickedQuantity > prd.shippedQuantity ||
            (prd.pickedQuantity === 0 && prd.shippedQuantity === 0)
          : prd.pickedQuantity > prd.shippedQuantity,
      ),
    );
    try {
      await this.sapService.updateOrder(
        order.orderProducts[0].ENTSAP ?? '',
        productsToSend.map((prod) => ({
          MATNR: prod.SKUSAP,
          LFIMG: prod.pickedQuantity,
        })),
        submitOrderDto.isLastBox,
        submitOrderDto.name,
      );
    } catch (error) {
      console.log('Error completing order SAP', error);
    }

    const newProducts = order.orderProducts.map((product) => {
      if (product.done) {
        product.shippedQuantity = product.pickedQuantity;
      }
      return product;
    });

    order.orderProducts = newProducts;

    if (submitOrderDto.isLastBox) {
      order.status = 3;
      order.orderProducts.forEach((product) => {
        product.done = true;
      });
    }

    return await this.ordersRepository.save(order);
  }

  async onRequestCompleteOrder(PEDSAP: string) {
    const order = await this.ordersRepository.findOneBy({
      PEDSAP,
    });

    if (!order) {
      throw new HttpException(
        'No hay orden asignada a esta ubicación',
        HttpStatus.NOT_FOUND,
      );
    }

    this.submitOrderComplete(order.id, {
      isLastBox: true,
    });

    return order;
  }

  async onBarcodeScanned(barcodedString: string) {
    if (!barcodedString) {
      throw new Error('Invalid barcode string');
    } else {
      const regex = /\[([^\]]+)\](\d+)/;
      const match = barcodedString.match(regex);
      if (!match) {
        throw new Error('Invalid barcode format');
      }
      const sorterID = match[1];
      const barcode = match[2];

      const orders = await this.ordersRepository.findBy({
        sorter: sorterID,
      });

      const newOrders = await Promise.all(
        orders.map(async (order) => {
          const orderProduct = order.orderProducts.find(
            (p) => p.product.EAN === barcode,
          );
          if (orderProduct) {
            console.log('orderProduct exists [Location ID]:', order.location);
            this.ordersRepository.update(order.id, {
              currentProductEAN: barcode,
              currentProductQuantity: orderProduct?.quantity ?? 0,
            });
          }
          return {
            ...order,
            currentProductEAN: barcode,
            currentProductQuantity: orderProduct?.quantity ?? 0,
          };
        }),
      );

      return newOrders;
    }
  }

  async getOrdersByWave(wave: string) {
    const orders = await this.ordersRepository.find({
      where: { wave },
      relations: ['orderProducts', 'orderProducts.product'],
    });
    return orders;
  }

  async getOrdersGroupedByWave() {
    const orders = await this.ordersRepository.find();

    const groupedOrders = orders.reduce((acc, order) => {
      if (!acc[order.wave]) {
        acc[order.wave] = {
          wave: order.wave,
          totalProducts: 0,
          totalPicked: 0,
        };
      }
      if (!acc[order.wave].orders) {
        acc[order.wave].orders = [];
      }
      const totalProducts = order.orderProducts.reduce(
        (total, product) => total + product.quantity,
        0,
      );
      const totalPicked = order.orderProducts.reduce(
        (total, product) => total + product.pickedQuantity,
        0,
      );
      acc[order.wave].orders.push({
        ...order,
        totalProducts,
        totalPicked,
      });
      acc[order.wave].totalProducts =
        (acc[order.wave].totalProducts ?? 0) + totalProducts;
      acc[order.wave].totalPicked =
        (acc[order.wave].totalPicked ?? 0) + totalPicked;
      return acc;
    }, {});

    return groupedOrders;
  }

  async getOrderByPEDSAP(PEDSAP: string) {
    const order = await this.ordersRepository.findOne({
      where: { PEDSAP },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async clearOrders() {
    console.log('Clearing orders...');

    return await this.ordersRepository.clear();
  }
}
