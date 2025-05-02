import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EslService } from './esl.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LabelDto } from './dto/label.dto';

@ApiTags('ESL')
@Controller('esl')
export class ESLController {
  constructor(private readonly eslService: EslService) {}

  // Locations

  @Post('locations')
  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({ status: 201, description: 'Location successfully created' })
  async createLocation(@Body() locationData: CreateLocationDto) {
    return await this.eslService.createLocation(locationData);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({
    status: 200,
    description: 'List of all locations',
    type: [CreateLocationDto],
  })
  async getLocations() {
    return await this.eslService.getAllLocations();
  }

  @ApiOperation({ summary: 'Get all locations by sorter' })
  @Get('locations/sorter/:sorterId')
  @ApiParam({ name: 'sorterId', description: 'Sorter ID' })
  @ApiResponse({
    status: 200,
    description: 'List of all locations by sorter',
    type: [CreateLocationDto],
  })
  async getLocationsBySorter(@Param('sorterId') sorterId: string) {
    return await this.eslService.getAllLocationsBySorter(sorterId);
  }

  @Get('locations-available')
  @ApiOperation({ summary: 'Get all available locations' })
  @ApiResponse({
    status: 200,
    description: 'List of available locations',
    type: [CreateLocationDto],
  })
  async getAvailableLocations() {
    return await this.eslService.getAvailableLocations();
  }

  @Get('locations/:id')
  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Location found',
    type: CreateLocationDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async getLocationById(@Param('id') id: string) {
    return await this.eslService.getLocationById(id);
  }

  @Put('locations/:id/product-ean')
  @ApiOperation({ summary: 'Update product EAN of a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiBody({ type: UpdateLocationDto })
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
  @ApiOperation({ summary: 'Update product quantity of a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiBody({ type: UpdateLocationDto })
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
  @ApiOperation({ summary: 'Update label name of a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiBody({ type: UpdateLocationDto })
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
  @ApiOperation({ summary: 'Update order ID of a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiBody({ type: UpdateLocationDto })
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
  @ApiOperation({ summary: 'Delete a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Location deleted' })
  async deleteLocation(@Param('id') id: string) {
    return await this.eslService.deleteLocation(id);
  }

  // Labels

  @Get('labels')
  @ApiOperation({ summary: 'Get all labels' })
  @ApiResponse({
    status: 200,
    description: 'List of all labels',
    type: [LabelDto],
  })
  async getLabels() {
    return await this.eslService.getAllLabels();
  }

  @Get('labels/:id')
  @ApiOperation({ summary: 'Get a label by ID' })
  @ApiParam({ name: 'id', description: 'Label ID' })
  @ApiResponse({ status: 200, description: 'Label found', type: LabelDto })
  async getLabelById(@Param('id') id: string) {
    return await this.eslService.getLabelById(id);
  }

  @Post('link-label')
  @ApiOperation({ summary: 'Link a label to a location' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        labelId: { type: 'string', example: '1' },
        locationId: { type: 'string', example: '1' },
      },
    },
  })
  async linkLabelToLocation(
    @Body('labelId') labelId: string,
    @Body('locationId') locationId: string,
  ) {
    return await this.eslService.linkLabelToLocation(labelId, locationId);
  }

  @Get('labels-available')
  @ApiOperation({ summary: 'Get all available (unlinked) labels' })
  @ApiResponse({
    status: 200,
    description: 'List of available labels',
    type: [LabelDto],
  })
  async getAvailableLabels() {
    return await this.eslService.getAvailableLabels();
  }

  @ApiOperation({ summary: 'Makes the label emit a sound' })
  @Post('labels/:id/sound')
  @ApiParam({ name: 'id', description: 'Label ID' })
  @ApiResponse({ status: 200, description: 'Sound emitted' })
  async emitLabelSound(@Param('id') id: string) {
    return await this.eslService.emitLabelSound(id);
  }

  @ApiOperation({ summary: 'Makes the label blink' })
  @Post('labels/:id/blink')
  @ApiParam({ name: 'id', description: 'Label ID' })
  @ApiResponse({ status: 200, description: 'Label blinking' })
  async blinkLabel(@Param('id') id: string) {
    return await this.eslService.flashLabelLed(id, 'RED', 1000, 100, 2);
  }
}
