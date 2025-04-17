import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EslService } from './esl.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [EslService],
  exports: [EslService],
})
export class EslModule {}
