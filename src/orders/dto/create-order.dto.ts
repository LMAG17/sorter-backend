export class CreateOrderDto {
    products: {
        id: number;
        ubicacion: string;
        EAN: number;
        cantidad: number;
    }[];
}
