import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { CreateHolidayCalendarDto } from './dtos/create-holiday-calendar.dto';
import { CreateHolidayDto } from './dtos/create-holiday.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('لم يتم العثور على معرف بيئة العمل (Tenant ID)');
    }
    return tenantId;
  }

  async getSettings() {
    const tenantId = this.getTenantId();

    let settings = await this.prisma.db.workspaceSetting.findUnique({
      where: { organizationId: tenantId },
    });

    if (!settings) {
      // Create default settings
      settings = await this.prisma.db.workspaceSetting.create({
        data: {
          organizationId: tenantId,
          branding: {
            logoUrl: null,
            primaryColor: '#1A365D',
            secondaryColor: '#718096',
          },
          localization: {
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'HH:mm',
            numberFormat: '1,000.00',
            timeZone: 'Asia/Riyadh',
            defaultLanguage: 'ar',
          },
          preferences: {
            fiscalYearStart: '01-01',
            weekStart: 0,
            defaultCurrency: 'SAR',
            workingDays: [0, 1, 2, 3, 4],
            workingHoursStart: '08:00',
            workingHoursEnd: '17:00',
          },
          numbering: {
            caseNumberPattern: 'CASE-{YYYY}-{SEQ}',
            invoiceNumberPattern: 'INV-{YYYY}-{SEQ}',
          },
          featureFlags: {
            aiEnabled: false,
            clientPortalEnabled: false,
            ocrEnabled: false,
            financeEnabled: false,
            knowledgeEnabled: false,
          },
        },
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const tenantId = this.getTenantId();

    const existing = await this.getSettings();

    const updatedBranding = dto.branding ? { ...existing.branding as object, ...dto.branding } : existing.branding;
    const updatedLocalization = dto.localization ? { ...existing.localization as object, ...dto.localization } : existing.localization;
    const updatedPreferences = dto.preferences ? { ...existing.preferences as object, ...dto.preferences } : existing.preferences;
    const updatedNumbering = dto.numbering ? { ...existing.numbering as object, ...dto.numbering } : existing.numbering;
    const updatedFeatureFlags = dto.featureFlags ? { ...existing.featureFlags as object, ...dto.featureFlags } : existing.featureFlags;

    return this.prisma.db.workspaceSetting.update({
      where: { organizationId: tenantId },
      data: {
        branding: updatedBranding,
        localization: updatedLocalization,
        preferences: updatedPreferences,
        numbering: updatedNumbering,
        featureFlags: updatedFeatureFlags,
      },
    });
  }

  async getStatistics() {
    const tenantId = this.getTenantId();

    // Recalculate stats dynamically
    const casesCount = await this.prisma.db.case.count({ where: { organizationId: tenantId } });
    const clientsCount = await this.prisma.db.client.count({ where: { organizationId: tenantId } });
    const documentsCount = await this.prisma.db.document.count({ where: { organizationId: tenantId } });
    const membersCount = await this.prisma.db.organizationMember.count({ where: { organizationId: tenantId } });

    const stats = await this.prisma.db.workspaceStatistic.upsert({
      where: { organizationId: tenantId },
      update: {
        casesCount,
        clientsCount,
        documentsCount,
        membersCount,
      },
      create: {
        organizationId: tenantId,
        casesCount,
        clientsCount,
        documentsCount,
        membersCount,
        revenue: 0.00,
        storageUsed: 0n,
      },
    });

    // Convert BigInt to string for JSON serialization compatibility
    return {
      ...stats,
      storageUsed: stats.storageUsed.toString(),
    };
  }

  async createHolidayCalendar(dto: CreateHolidayCalendarDto) {
    const tenantId = this.getTenantId();

    return this.prisma.db.holidayCalendar.create({
      data: {
        organizationId: tenantId,
        name: dto.name,
      },
    });
  }

  async getHolidayCalendars() {
    const tenantId = this.getTenantId();

    return this.prisma.db.holidayCalendar.findMany({
      where: { organizationId: tenantId },
      include: { holidays: true },
    });
  }

  async createHoliday(dto: CreateHolidayDto) {
    const tenantId = this.getTenantId();

    // Verify calendar exists and belongs to same tenant
    const calendar = await this.prisma.db.holidayCalendar.findUnique({
      where: { id: dto.holidayCalendarId },
    });

    if (!calendar || calendar.organizationId !== tenantId) {
      throw new BadRequestException('تقويم الإجازات المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
    }

    return this.prisma.db.holiday.create({
      data: {
        holidayCalendarId: dto.holidayCalendarId,
        date: new Date(dto.date),
        name: dto.name,
        isRecurring: dto.isRecurring ?? false,
      },
    });
  }

  async getHolidays(calendarId: string) {
    const tenantId = this.getTenantId();

    const calendar = await this.prisma.db.holidayCalendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar || calendar.organizationId !== tenantId) {
      throw new NotFoundException('تقويم الإجازات غير موجود');
    }

    return this.prisma.db.holiday.findMany({
      where: { holidayCalendarId: calendarId },
      orderBy: { date: 'asc' },
    });
  }
}
