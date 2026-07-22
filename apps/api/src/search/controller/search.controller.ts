import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GlobalSearchService } from '../service/global-search.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { SearchEntityType } from '../indexers/search-result.interface';

@Controller('search')
@UseGuards(AuthGuard, PermissionsGuard)
export class SearchController {
  constructor(private readonly searchService: GlobalSearchService) {}

  @Get('global')
  @Permissions('search.global.execute')
  async globalSearch(
    @Query('query') query: string,
    @Query('types') typesStr?: string,
    @Query('limit') limit?: string,
  ) {
    const types = typesStr ? (typesStr.split(',') as SearchEntityType[]) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const data = await this.searchService.globalSearch({
      query,
      types,
      limit: limitNum,
    });

    return { success: true, data };
  }

  @Get('suggestions')
  @Permissions('search.global.execute')
  async getSuggestions(@Query('query') query: string) {
    const suggestions = await this.searchService.getSuggestions(query);
    return { success: true, suggestions };
  }
}
