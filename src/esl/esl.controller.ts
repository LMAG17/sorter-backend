import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EslService } from './esl.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('esl')
export class ESLController {
  constructor(private readonly eslService: EslService) {}

  // Locations is connected directly to the Opticon Database,
  // we should use this references to update the labels

  @Post('locations')
  async createLocation(@Body() locationData: CreateLocationDto) {
    return await this.eslService.createLocation(locationData);
  }

  @Get('locations')
  async getLocations() {
    return await this.eslService.getAllLocations();
  }

  @Get('locations-available')
  async getAvailableLocations() {
    return await this.eslService.getAvailableLocations();
  }

  @Get('locations/:id')
  async getLocationById(@Param('id') id: string) {
    return await this.eslService.getLocationById(id);
  }

  @Put('locations/:id/product-ean')
  async updateLocationEAN(
    @Param('id') id: string,
    @Body() locationData: UpdateLocationDto,
  ) {
    return await this.eslService.updateLocation(
      id,
      'productEAN',
      locationData.productEAN ?? '',
    );
  }

  @Put('locations/:id/product-quantity')
  async updateLocationQuantity(
    @Param('id') id: string,
    @Body() locationData: UpdateLocationDto,
  ) {
    return await this.eslService.updateLocation(
      id,
      'productQuantity',
      locationData.productQuantity ?? 0,
    );
  }

  @Put('locations/:id/label-name')
  async updateLocationLabelName(
    @Param('id') id: string,
    @Body() locationData: UpdateLocationDto,
  ) {
    return await this.eslService.updateLocation(
      id,
      'name',
      locationData.name ?? '',
    );
  }

  @Put('locations/:id/order-id')
  async updateLocationOrderId(
    @Param('id') id: string,
    @Body() locationData: UpdateLocationDto,
  ) {
    return await this.eslService.updateLocation(
      id,
      'orderID',
      locationData.orderID ?? '',
    );
  }

  @Delete('locations/:id')
  async deleteLocation(@Param('id') id: string) {
    return await this.eslService.deleteLocation(id);
  }

  // Labels
  @Get('labels')
  async getLabels() {
    return await this.eslService.getAllLabels();
  }

  @Get('labels/:id')
  async getLabelById(@Param('id') id: string) {
    return await this.eslService.getLabelById(id);
  }

  @Post('link-label')
  async linkLabelToLocation(
    @Body('labelId') labelId: string,
    @Body('locationId') locationId: string,
  ) {
    return await this.eslService.linkLabelToLocation(labelId, locationId);
  }

  @Get('labels-available')
  async getAvailableLabels() {
    return await this.eslService.getAvailableLabels();
  }
}
