import { Get, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EslService } from 'src/esl/esl.service';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { AssignOrderDto } from './dto/assign-order.dto';
import { AssignProductForPickingDto } from './dto/assign-product.dto';
import { SapService } from 'src/sap/sap.service';
import { SubmitProductQuantityDto } from './dto/submit-product-quantity.dto';
import { SubmitOrderDto } from './dto/submit-order.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private readonly eslService: EslService,
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
      const orderProductIndex = order.orderProducts.findIndex(
        (p) => p.product.EAN === productEAN,
      );

      const orderProduct = order.orderProducts[orderProductIndex];

      if (!orderProduct) {
        throw new Error('Product not found in order');
      }

      this.ordersRepository.update(order.id, {
        currentProductEAN: orderProduct.product.EAN,
        currentProductQuantity: orderProduct.quantity,
      });
      try {
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
      } catch (error) {
        console.log('Error updating ESL location:', error);
      }
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

    let newOrdersData: any[] = [];

    for (const order of newOrders) {
      const orderData = await this.create(order);
      try {
        await this.eslService.updateLocation(
          order.location,
          'orderID',
          orderData.PEDSAP ?? orderData.id,
        );
      } catch (error) {
        console.log('Error updating ESL location:', error);
      }
      newOrdersData.push(orderData);
    }

    return [...existingOrders, ...newOrdersData];
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

    await this.sapService.updateOrder(
      order.orderProducts[0].ENTSAP ?? '',
      order.orderProducts.map((prod) => ({
        MATNR: prod.SKUSAP,
        LFIMG: prod.pickedQuantity,
      })),
      submitOrderDto.isLastBox,
    );

    if (submitOrderDto.isLastBox) {
      order.status = 3;
      this.eslService.updateLocation(order.location, 'productEAN', ' ');
      this.eslService.updateLocation(order.location, 'productQuantity', 0);
      this.eslService.updateLocation(order.location, 'orderID', ' ');
    }

    return await this.ordersRepository.save(order);
  }

  async submitProductCompleted(locationId: string, tagId?: string) {
    console.log('TagId', tagId);

    const [location] = await this.eslService.getLocationById(locationId);

    if (!location) {
      throw new Error('No hay ubicación asignada');
    }

    const [order] = await this.ordersRepository.findBy({
      PEDSAP: location.orderID,
    });

    if (!order) {
      throw new Error('No hay orden asignada a esta ubicación');
    }

    const currentProductIndex = order.orderProducts.findIndex(
      (product) => product.product.EAN === order.currentProductEAN,
    );

    await this.updateLocationWithEANandQuantity(locationId, ' ', 0);
    if (currentProductIndex < 0) {
      const newOrder = {
        ...order,
        currentProductEAN: '',
        currentProductQuantity: 0,
      };
      await this.ordersRepository.save(newOrder);
      return newOrder;
    }

    const newOrder = { ...order };

    newOrder.orderProducts[currentProductIndex].pickedQuantity =
      newOrder.orderProducts[currentProductIndex].quantity;
    newOrder.orderProducts[currentProductIndex].done = true;

    newOrder.currentProductEAN = '';
    newOrder.currentProductQuantity = 0;

    const [{ MAC }] = await this.eslService.getLabelById(locationId);

    this.eslService.emitLabelSound(MAC);

    const leftProducts = newOrder.orderProducts.filter(
      (product) => !product.done,
    );

    if (leftProducts.length <= 0) {
      newOrder.status = 3;
      await this.eslService.updateLocation(locationId, 'productEAN', ' ');
      await this.eslService.updateLocation(locationId, 'productQuantity', 0);
      await this.eslService.updateLocation(locationId, 'orderID', ' ');
      await this.sapService.updateOrder(
        newOrder.orderProducts[0].ENTSAP ?? '',
        newOrder.orderProducts.map((prod) => ({
          MATNR: prod.SKUSAP,
          LFIMG: prod.pickedQuantity,
        })),
        true,
      );
    }

    await this.ordersRepository.save(newOrder);

    return newOrder;
  }

  async updateLocationWithEANandQuantity(
    locationId: string,
    productEAN: string,
    productQuantity: number,
  ) {
    await this.eslService.updateLocation(locationId, 'productEAN', productEAN);
    await this.eslService.updateLocation(
      locationId,
      'productQuantity',
      productQuantity,
    );

    return locationId;
  }

  async onBarcodeScanned(barcodedString: string) {
    const regex = /\[([^\]]+)\](\d+)/;
    const match = barcodedString.match(regex);
    if (!match) {
      throw new Error('Invalid barcode format');
    }
    const sorterID = match[1];
    const barcode = match[2];

    const locations = await this.eslService.getAllLocationsBySorter(sorterID);

    const orderIDs = locations
      .map((location) => location.orderID)
      .filter((orderID) => !!orderID);

    const orders = await this.ordersRepository.findBy({
      PEDSAP: In(orderIDs),
    });

    const newOrders = await Promise.all(
      orders.map(async (order) => {
        const orderProduct = order.orderProducts.find(
          (p) => p.product.EAN === barcode,
        );
        if (orderProduct) {
          console.log('orderProduct exists [Location ID]:', order.location);
          await this.updateLocationWithEANandQuantity(
            order.location,
            orderProduct.product.EAN,
            orderProduct.quantity,
          );
        } else {
          console.log(
            'orderProduct does not exist [Location ID]:',
            order.location,
          );
          await this.updateLocationWithEANandQuantity(
            order.location,
            barcode,
            0,
          );
        }
        this.ordersRepository.update(order.id, {
          currentProductEAN: barcode,
          currentProductQuantity: orderProduct?.quantity ?? 0,
        });
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
