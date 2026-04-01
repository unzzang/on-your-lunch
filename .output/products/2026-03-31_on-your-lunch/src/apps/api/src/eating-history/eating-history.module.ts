import { Module } from '@nestjs/common';
import { EatingHistoryController } from './eating-history.controller';
import { EatingHistoryService } from './eating-history.service';

@Module({
  controllers: [EatingHistoryController],
  providers: [EatingHistoryService],
  exports: [EatingHistoryService],
})
export class EatingHistoryModule {}
