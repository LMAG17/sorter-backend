import { ApiProperty } from '@nestjs/swagger';

export class LabelDto {
  @ApiProperty({ example: 'label-123', description: 'Unique label identifier' })
  ID: string;

  @ApiProperty({
    example: '00:1A:7D:DA:71:13',
    description: 'MAC address of the label',
  })
  MAC: string;

  @ApiProperty({
    example: 'group-1',
    description: 'Group the label belongs to',
    nullable: true,
  })
  GROUP: string | null;

  @ApiProperty({
    example: 'Label on shelf A2',
    description: 'Description of the label',
  })
  DESCRIPTION: string;

  @ApiProperty({
    example: 'image.png',
    description: 'Filename of the image assigned to the label',
  })
  IMAGE_FILE: string;

  @ApiProperty({ example: 300, description: 'Polling interval in seconds' })
  POLL_INTERVAL: number;

  @ApiProperty({ example: 30, description: 'Polling timeout in seconds' })
  POLL_TIMEOUT: number;

  @ApiProperty({ example: 600, description: 'Scan interval in seconds' })
  SCAN_INTERVAL: number;

  @ApiProperty({ example: 11, description: 'Channel the label is using' })
  CHANNEL: number;

  @ApiProperty({
    example: '11,12,13',
    description: 'Channels available for scanning',
  })
  SCAN_CHANNELS: string;

  @ApiProperty({ example: 'OK', description: 'Current battery status' })
  BATTERY_STATUS: string;

  @ApiProperty({ example: 3.7, description: 'Battery voltage in volts' })
  BATTERY_VOLTAGE: number;

  @ApiProperty({ example: 'ESL-29', description: 'Label variant model' })
  VARIANT: string;

  @ApiProperty({ example: 'v1.2.3', description: 'Firmware version' })
  VERSION: string;

  @ApiProperty({
    example: null,
    description: 'Firmware sub-version',
    nullable: true,
  })
  SUB_VERSION: string | null;

  @ApiProperty({ example: 42, description: 'Image ID from the server' })
  IMAGE_ID: number;

  @ApiProperty({ example: 21, description: 'Local image ID stored on label' })
  IMAGE_ID_LOCAL: number;

  @ApiProperty({
    example: null,
    description: 'Backlight setting (if supported)',
    nullable: true,
  })
  BACKLIGHT: string | null;

  @ApiProperty({ example: 'default', description: 'Display options config' })
  DISPLAY_OPTIONS: string;

  @ApiProperty({ example: 'blink', description: 'LED options config' })
  LED_OPTIONS: string;

  @ApiProperty({ example: 'enabled', description: 'NFC options config' })
  NFC_OPTIONS: string;

  @ApiProperty({
    example: 3,
    description: 'Number of LED flashes',
    nullable: true,
  })
  LED_FLASH_COUNT: number | null;

  @ApiProperty({ example: 255, description: 'Link quality indicator' })
  LQI: number;

  @ApiProperty({
    example: 230,
    description: 'Received signal strength (LQI_RX)',
  })
  LQI_RX: number;

  @ApiProperty({
    example: '2025-04-18T16:00:00Z',
    description: 'Last poll time in ISO string',
  })
  LAST_POLL: string;

  @ApiProperty({ example: 'Updated info OK', description: 'Last info status' })
  LAST_INFO: string;

  @ApiProperty({
    example: 'img20250418.png',
    description: 'Last image filename',
  })
  LAST_IMAGE: string;

  @ApiProperty({
    example: 'base-42',
    description: 'ID of the base station the label is connected to',
  })
  BASE_STATION: string;

  @ApiProperty({ example: 'active', description: 'Current label status' })
  STATUS: string;

  @ApiProperty({
    example: 'updated',
    description: 'Status of the current image',
  })
  IMAGE_STATUS: string;

  @ApiProperty({ example: 'up-to-date', description: 'Firmware update status' })
  FIRMWARE_STATUS: string;

  @ApiProperty({
    example: 5,
    description: 'Number of times the label has rebooted',
  })
  BOOT_COUNT: number;

  @ApiProperty({ example: 22, description: 'Temperature in Celsius' })
  TEMPERATURE: number;

  @ApiProperty({ example: 'lan-123', description: 'LAN ID of the label' })
  LANID: string;

  @ApiProperty({
    example: 296,
    description: 'Width of the label display in pixels',
  })
  WIDTH: number;

  @ApiProperty({
    example: 128,
    description: 'Height of the label display in pixels',
  })
  HEIGHT: number;

  @ApiProperty({
    example: 1,
    description: 'Image format (e.g., 1 for BMP, 2 for PNG)',
  })
  IMG_FORMAT: number;
}
