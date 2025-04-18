import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EslService } from './esl.service';
import { ESLController } from './esl.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [EslService],
  exports: [EslService],
  controllers: [ESLController],
})
export class EslModule {}
