import { Controller, Get } from '@nestjs/common';
import { SapService } from './sap.service';

@Controller('sap')
export class SapController {
  constructor(private readonly sapService: SapService) {}

  @Get()
  async getSapData() {
    return this.sapService.getOrders();
  }
  @Get('test-update')
  async testUpdate() {
    return this.sapService.updateOrder('123', [], false);
  }
}
