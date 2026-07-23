import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningService } from './services/learning.service';
import { LearningAnalyticsService } from './services/learning-analytics.service';
import { PrismaService } from '../shared/database/prisma.service';

@Module({
  controllers: [LearningController],
  providers: [PrismaService, LearningService, LearningAnalyticsService],
  exports: [LearningService, LearningAnalyticsService],
})
export class LearningModule {}
