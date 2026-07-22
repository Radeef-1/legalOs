import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { BaseIntegrationAdapter } from '../sdk/base-integration.adapter';
import { IntegrationProviderType } from '@prisma/client';

@Injectable()
export class ProviderRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ProviderRegistryService.name);
  private readonly adaptersMap = new Map<string, BaseIntegrationAdapter>();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.seedDefaultProviders();
    } catch (err) {
      this.logger.warn('ProviderRegistryService: Could not seed default providers because database is offline.');
    }
  }

  /**
   * Registers a connector adapter plugin into the Integration Hub & syncs DB record.
   */
  async registerAdapter(adapter: BaseIntegrationAdapter) {
    this.adaptersMap.set(adapter.providerCode, adapter);
    this.logger.log(`Registered Integration Adapter Plugin: "${adapter.nameEn}" (${adapter.providerCode})`);

    const typeMap: Record<string, IntegrationProviderType> = {
      najiz: IntegrationProviderType.GOVERNMENT,
      zatca: IntegrationProviderType.GOVERNMENT,
      google_calendar: IntegrationProviderType.PRODUCTIVITY,
      outlook_calendar: IntegrationProviderType.PRODUCTIVITY,
      odoo: IntegrationProviderType.BUSINESS,
      sap: IntegrationProviderType.BUSINESS,
      salla: IntegrationProviderType.BUSINESS,
      hubspot: IntegrationProviderType.BUSINESS,
      webhook: IntegrationProviderType.WEBHOOK,
    };

    const type = typeMap[adapter.providerCode] || IntegrationProviderType.BUSINESS;

    try {
      await (this.prisma as any).integrationProvider.upsert({
        where: { code: adapter.providerCode },
        create: {
          code: adapter.providerCode,
          nameAr: adapter.nameAr,
          nameEn: adapter.nameEn,
          type,
          authType: adapter.authType,
          baseUrl: null,
        },
        update: {
          nameAr: adapter.nameAr,
          nameEn: adapter.nameEn,
          type,
          authType: adapter.authType,
        },
      });
    } catch (err) {
      this.logger.warn(`ProviderRegistryService: Skipping DB upsert for adapter ${adapter.providerCode} (DB offline).`);
    }
  }

  getAdapter(providerCode: string): BaseIntegrationAdapter | undefined {
    return this.adaptersMap.get(providerCode);
  }

  async seedDefaultProviders() {
    const defaultProviders = [
      {
        code: 'najiz',
        nameAr: 'بوابة ناجز القضائية',
        nameEn: 'MoJ Najiz Judicial Portal',
        type: IntegrationProviderType.GOVERNMENT,
        authType: 'CERTIFICATE',
        baseUrl: 'https://api.najiz.sa/v1',
      },
      {
        code: 'zatca',
        nameAr: 'هيئة الزكاة والضريبة والجمارك (زاتكا)',
        nameEn: 'ZATCA E-Invoicing Phase 2',
        type: IntegrationProviderType.GOVERNMENT,
        authType: 'API_KEY',
        baseUrl: 'https://gw.zatca.gov.sa/e-invoicing/developer-portal',
      },
      {
        code: 'google_calendar',
        nameAr: 'تقويم جووجل Workspace',
        nameEn: 'Google Workspace Calendar',
        type: IntegrationProviderType.PRODUCTIVITY,
        authType: 'OAUTH2',
        baseUrl: 'https://www.googleapis.com/calendar/v3',
      },
      {
        code: 'outlook_calendar',
        nameAr: 'تقويم مايكروسوفت أوتلوك 365',
        nameEn: 'Microsoft Outlook 365 Calendar',
        type: IntegrationProviderType.PRODUCTIVITY,
        authType: 'OAUTH2',
        baseUrl: 'https://graph.microsoft.com/v1.0',
      },
      {
        code: 'webhook',
        nameAr: 'خطافات الويب وتكاملات الـ ERP',
        nameEn: 'Outbound Webhook Dispatcher',
        type: IntegrationProviderType.WEBHOOK,
        authType: 'API_KEY',
        baseUrl: null,
      },
    ];

    for (const p of defaultProviders) {
      try {
        await (this.prisma as any).integrationProvider.upsert({
          where: { code: p.code },
          create: p,
          update: {
            nameAr: p.nameAr,
            nameEn: p.nameEn,
            type: p.type,
            authType: p.authType,
            baseUrl: p.baseUrl,
          },
        });
      } catch (err) {
        // Skip DB upsert when offline
      }
    }
  }

  async getAllProviders() {
    return (this.prisma as any).integrationProvider.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async getProviderByCode(code: string) {
    return (this.prisma as any).integrationProvider.findUnique({
      where: { code },
    });
  }
}
