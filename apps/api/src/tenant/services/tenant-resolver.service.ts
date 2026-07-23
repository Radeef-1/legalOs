import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

export interface TenantConfigDto {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  portalDomain?: string;
  supportEmail?: string;
  supportPhone?: string;
  workingHours?: string;
  theme: string;
  customCss?: string;
  settings: {
    branding: {
      primary: string;
      secondary: string;
      logo?: string;
      favicon?: string;
    };
    theme: {
      mode: 'light' | 'dark' | 'auto';
      font: string;
      density: 'compact' | 'comfortable' | 'enterprise';
    };
    navigation: {
      layout: 'sidebar' | 'top' | 'hybrid';
      hiddenModules: string[];
    };
    features: {
      ai: boolean;
      portal: boolean;
      calendar: boolean;
      billing: boolean;
      crm: boolean;
      accounting: boolean;
    };
    communication: {
      emailSignature?: string;
      smsSender?: string;
    };
  };
}

@Injectable()
export class TenantResolverService {
  private readonly logger = new Logger(TenantResolverService.name);
  private cache = new Map<string, { config: TenantConfigDto; expiresAt: number }>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves tenant runtime configuration by domain, subdomain, or ID
   */
  async resolveTenantConfig(hostOrSlugOrId: string): Promise<TenantConfigDto> {
    const cleanHost = hostOrSlugOrId ? hostOrSlugOrId.split(':')[0].toLowerCase() : 'otaibi-law';
    
    // Check Cache
    const cached = this.cache.get(cleanHost);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.config;
    }

    let slug = cleanHost;
    if (cleanHost.includes('.')) {
      slug = cleanHost.split('.')[0];
    }

    // Query Database
    let org = await this.prisma.db.organization.findFirst({
      where: {
        OR: [
          { slug: slug },
          { portalDomain: cleanHost },
          { id: cleanHost.length === 36 ? cleanHost : undefined },
        ],
      },
    });

    if (!org) {
      org = await this.prisma.db.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      });
    }

    const name = org?.name || 'مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية';
    const primaryColor = org?.primaryColor || '#041627';
    const secondaryColor = org?.secondaryColor || '#1b6d24';

    const rawSettings: any = org?.settingsJson || {};
    const settings = {
      branding: {
        primary: rawSettings?.branding?.primary || primaryColor,
        secondary: rawSettings?.branding?.secondary || secondaryColor,
        logo: rawSettings?.branding?.logo || org?.logoUrl || undefined,
        favicon: rawSettings?.branding?.favicon || org?.faviconUrl || undefined,
      },
      theme: {
        mode: rawSettings?.theme?.mode || org?.theme || 'light',
        font: rawSettings?.theme?.font || org?.fontFamily || 'Cairo',
        density: rawSettings?.theme?.density || 'comfortable',
      },
      navigation: {
        layout: rawSettings?.navigation?.layout || 'sidebar',
        hiddenModules: rawSettings?.navigation?.hiddenModules || [],
      },
      features: {
        ai: rawSettings?.features?.ai ?? true,
        portal: rawSettings?.features?.portal ?? true,
        calendar: rawSettings?.features?.calendar ?? true,
        billing: rawSettings?.features?.billing ?? true,
        crm: rawSettings?.features?.crm ?? true,
        accounting: rawSettings?.features?.accounting ?? true,
      },
      communication: {
        emailSignature: rawSettings?.communication?.emailSignature || `جميع الحقوق محفوظة © 2026 ${name}`,
        smsSender: rawSettings?.communication?.smsSender || org?.slug?.substring(0, 11) || 'العتيبي',
      },
    };

    const config: TenantConfigDto = {
      id: org?.id || 'org-salman-2026',
      slug: org?.slug || 'otaibi-law',
      name,
      logoUrl: org?.logoUrl || undefined,
      faviconUrl: org?.faviconUrl || undefined,
      primaryColor,
      secondaryColor,
      fontFamily: org?.fontFamily || 'Cairo',
      language: org?.language || 'ar',
      timezone: org?.timezone || 'Asia/Riyadh',
      dateFormat: org?.dateFormat || 'YYYY-MM-DD',
      currency: org?.currency || 'SAR',
      portalDomain: org?.portalDomain || undefined,
      supportEmail: org?.supportEmail || 'info@lawfirm.sa',
      supportPhone: org?.supportPhone || '0549040268',
      workingHours: org?.workingHours || 'الأحد - الخميس: 8:00 ص - 5:00 م',
      theme: org?.theme || 'light',
      customCss: org?.customCss || undefined,
      settings,
    };

    // Store in Cache for 60 seconds
    this.cache.set(cleanHost, { config, expiresAt: Date.now() + 60000 });
    return config;
  }

  /**
   * Updates tenant runtime branding & white label JSON settings in real-time
   */
  async updateTenantConfig(orgId: string, partialConfig: Partial<TenantConfigDto>) {
    const current = await this.resolveTenantConfig(orgId);
    const updatedSettings = {
      ...current.settings,
      ...partialConfig.settings,
      branding: {
        ...current.settings.branding,
        ...(partialConfig.primaryColor ? { primary: partialConfig.primaryColor } : {}),
        ...(partialConfig.secondaryColor ? { secondary: partialConfig.secondaryColor } : {}),
        ...partialConfig.settings?.branding,
      },
    };

    const updated = await this.prisma.db.organization.update({
      where: { id: orgId },
      data: {
        name: partialConfig.name,
        primaryColor: partialConfig.primaryColor,
        secondaryColor: partialConfig.secondaryColor,
        fontFamily: partialConfig.fontFamily,
        logoUrl: partialConfig.logoUrl,
        faviconUrl: partialConfig.faviconUrl,
        portalDomain: partialConfig.portalDomain,
        supportEmail: partialConfig.supportEmail,
        supportPhone: partialConfig.supportPhone,
        theme: partialConfig.theme,
        customCss: partialConfig.customCss,
        settingsJson: updatedSettings as any,
      },
    });

    // Invalidate cache
    this.cache.clear();
    return this.resolveTenantConfig(orgId);
  }
}
