import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { GlobalSearchService } from './global-search.service';
import { GlobalSearchController } from './global-search.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GlobalSearchController],
  providers: [GlobalSearchService],
  exports: [GlobalSearchService],
})
export class SearchModule {}
