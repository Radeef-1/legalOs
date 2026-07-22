import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export class UpdateBrandingDto {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  customDomain?: string;
  welcomeMessage?: string;
}

@Injectable()
export class PortalBrandingService {
  private readonly logger = new Logger(PortalBrandingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets portal branding for a specific organization.
   */
  async getBranding(organizationId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      let branding = await db.portalBranding.findUnique({
        where: { organizationId },
      });

      // Return default branding if none set
      if (!branding) {
        const org = await db.organization.findFirst({
          where: { id: organizationId },
          select: { name: true, slug: true },
        });

        return {
          organizationId,
          organizationName: org?.name || '',
          slug: org?.slug || '',
          logoUrl: null,
          primaryColor: '#1a365d',
          secondaryColor: '#2b6cb0',
          fontFamily: null,
          customDomain: null,
          welcomeMessage: `مرحباً بك في بوابة ${org?.name || 'المكتب'}`,
        };
      }

      // Enrich with org data
      const org = await db.organization.findFirst({
        where: { id: organizationId },
        select: { name: true, slug: true },
      });

      return {
        ...branding,
        organizationName: org?.name || '',
        slug: org?.slug || '',
      };
    });
  }

  /**
   * Updates portal branding for a specific organization.
   */
  async updateBranding(organizationId: string, dto: UpdateBrandingDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const branding = await db.portalBranding.upsert({
        where: { organizationId },
        create: {
          organizationId,
          logoUrl: dto.logoUrl || null,
          primaryColor: dto.primaryColor || '#1a365d',
          secondaryColor: dto.secondaryColor || '#2b6cb0',
          fontFamily: dto.fontFamily || null,
          customDomain: dto.customDomain || null,
          welcomeMessage: dto.welcomeMessage || null,
        },
        update: {
          ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
          ...(dto.primaryColor !== undefined ? { primaryColor: dto.primaryColor } : {}),
          ...(dto.secondaryColor !== undefined ? { secondaryColor: dto.secondaryColor } : {}),
          ...(dto.fontFamily !== undefined ? { fontFamily: dto.fontFamily } : {}),
          ...(dto.customDomain !== undefined ? { customDomain: dto.customDomain } : {}),
          ...(dto.welcomeMessage !== undefined ? { welcomeMessage: dto.welcomeMessage } : {}),
        },
      });

      this.logger.log(`[Portal Branding] Updated branding for Org [${organizationId}]`);

      return branding;
    });
  }

  /**
   * Resolves an organization by slug for portal login page.
   */
  async resolveBySlug(slug: string) {
    const org = await (this.prisma as any).organization.findFirst({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (!org) {
      throw new NotFoundException(`المكتب ذو المعرّف "${slug}" غير موجود.`);
    }

    const branding = await (this.prisma as any).portalBranding.findUnique({
      where: { organizationId: org.id },
    });

    return {
      organizationId: org.id,
      organizationName: org.name,
      slug: org.slug,
      logoUrl: branding?.logoUrl || null,
      primaryColor: branding?.primaryColor || '#1a365d',
      secondaryColor: branding?.secondaryColor || '#2b6cb0',
      fontFamily: branding?.fontFamily || null,
      welcomeMessage: branding?.welcomeMessage || `مرحباً بك في بوابة ${org.name}`,
    };
  }
}
