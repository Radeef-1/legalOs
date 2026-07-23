import { Controller, Get, Query } from '@nestjs/common';
import { GlobalSearchService } from './global-search.service';

@Controller('search')
export class GlobalSearchController {
  constructor(private readonly searchService: GlobalSearchService) {}

  @Get()
  async search(@Query('q') q: string, @Query('tenantId') tenantId?: string) {
    const data = await this.searchService.search(q, tenantId);
    return { success: true, data };
  }
}
