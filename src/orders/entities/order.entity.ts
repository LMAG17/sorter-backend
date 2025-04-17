export class Product {
  id: number;
  name: string;
  EAN: string;
  quantity: number;
}

export class Order {
  id: number;
  location: string;
  products: Product[];
}
