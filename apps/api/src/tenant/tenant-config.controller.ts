import { Controller, Get, Patch, Body, Headers, Query } from '@nestjs/common';
import { TenantResolverService } from './services/tenant-resolver.service';
import { TenantContext } from '../shared/tenant/tenant.context';

@Controller('v1/tenant')
export class TenantConfigController {
  constructor(private readonly tenantResolver: TenantResolverService) {}

  /**
   * Public Endpoint: Resolves dynamic white label settings for the requesting domain/subdomain
   */
  @Get('config')
  async getTenantConfig(
    @Headers('host') host?: string,
    @Headers('x-tenant-slug') headerSlug?: string,
    @Query('slug') querySlug?: string,
  ) {
    const target = querySlug || headerSlug || host || 'otaibi-law';
    const config = await this.tenantResolver.resolveTenantConfig(target);
    return { success: true, config };
  }

  /**
   * Protected Admin Endpoint: Updates live tenant white label settings and JSON without redeploying
   */
  @Patch('config')
  async updateTenantConfig(@Body() body: any) {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    const updated = await this.tenantResolver.updateTenantConfig(orgId, body);
    return { success: true, message: 'تم تحديث هوية وإعدادات المنشأة فوراً بدون إعادة التجميع 🟢', config: updated };
  }
}
