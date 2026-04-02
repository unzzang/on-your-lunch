import { Module } from '@nestjs/common';
import { EatingHistoryController } from './eating-history.controller';
import { EatingHistoryService } from './eating-history.service';

@Module({
  controllers: [EatingHistoryController],
  providers: [EatingHistoryService],
})
export class EatingHistoryModule {}
