import { PartialType } from '@nestjs/swagger';
import { CreateOrderGroupDto } from './create-order-group.dto';

export class UpdateOrderGroupDto extends PartialType(CreateOrderGroupDto) {}
