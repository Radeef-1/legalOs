import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProviderRegistryService } from '../core/provider-registry.service';
import { OAuthManagerService } from '../core/oauth-manager.service';
import { WebhookEngineService } from '../core/webhook-engine.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Controller('integrations')
@UseGuards(AuthGuard, PermissionsGuard)
export class IntegrationHubController {
  constructor(
    private readonly providerRegistry: ProviderRegistryService,
    private readonly oauthManager: OAuthManagerService,
    private readonly webhookEngine: WebhookEngineService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('providers')
  @Permissions('integrations.providers.view')
  async getProviders() {
    const providers = await this.providerRegistry.getAllProviders();
    return { success: true, providers };
  }

  @Get('connections')
  @Permissions('integrations.connections.view')
  async getConnections(@Req() req: any) {
    const organizationId = req.user?.organizationId || req.tenantId;
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const connections = await this.prisma.db.integrationConnection.findMany({
        where: { organizationId },
        include: { provider: true, webhooks: true },
      });
      return { success: true, connections };
    });
  }

  @Post('connect')
  @Permissions('integrations.connections.manage')
  async connect(
    @Req() req: any,
    @Body('providerCode') providerCode: string,
    @Body('credentials') credentials: Record<string, any>,
    @Body('metadata') metadata?: Record<string, any>,
  ) {
    const organizationId = req.user?.organizationId || req.tenantId;
    const connection = await this.oauthManager.saveConnection(
      organizationId,
      providerCode,
      credentials,
      metadata,
    );
    return { success: true, connection };
  }

  @Post('webhooks')
  @Permissions('integrations.webhooks.manage')
  async registerWebhook(
    @Body('connectionId') connectionId: string,
    @Body('targetUrl') targetUrl: string,
    @Body('events') events: string[],
    @Body('secretHeader') secretHeader?: string,
  ) {
    const endpoint = await this.webhookEngine.registerEndpoint(
      connectionId,
      targetUrl,
      events,
      secretHeader,
    );
    return { success: true, endpoint };
  }

  @Get('logs')
  @Permissions('integrations.logs.view')
  async getLogs(@Req() req: any) {
    const organizationId = req.user?.organizationId || req.tenantId;
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const logs = await this.prisma.db.integrationLog.findMany({
        take: 50,
        orderBy: { executedAt: 'desc' },
      });
      return { success: true, logs };
    });
  }
}
