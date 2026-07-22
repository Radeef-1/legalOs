import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';

export interface CopilotRecommendation {
  id: string;
  type: 'WARNING' | 'ACTION_REQUIRED' | 'OPTIMIZATION' | 'DEADLINE';
  title: string;
  description: string;
  suggestedActionPath: string;
}

@Injectable()
export class RecommendationEngineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates workspace data and produces proactive recommendations for lawyers and management.
   */
  async getRecommendations(organizationId: string): Promise<CopilotRecommendation[]> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;
      const recommendations: CopilotRecommendation[] = [];

      // Check 1: Upcoming hearings in next 48h
      const now = new Date();
      const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const upcomingHearings = await db.hearing.findMany({
        where: { organizationId, hearingDate: { gte: now, lte: next48h }, status: 'SCHEDULED' },
        include: { case: { select: { caseNumberInternal: true } } },
      });

      if (upcomingHearings.length > 0) {
        recommendations.push({
          id: 'rec-hearings-48h',
          type: 'DEADLINE',
          title: `لديك ${upcomingHearings.length} جلسة خلال الـ 48 ساعة القادمة`,
          description: `تأكد من مراجعة المذكرات وإخطار الموكلين للجلسة: ${upcomingHearings[0]?.title}`,
          suggestedActionPath: '/calendar',
        });
      }

      // Check 2: Overdue invoices
      const overdueInvoicesCount = await db.invoice.count({
        where: { organizationId, status: 'overdue' },
      });

      if (overdueInvoicesCount > 0) {
        recommendations.push({
          id: 'rec-overdue-invoices',
          type: 'WARNING',
          title: `يوجد ${overdueInvoicesCount} فاتورة متأخرة المباشرة السداد`,
          description: 'ينصح بإرسال تذكير سداد آلي أو التواصل مع الموكلين عبر البوابة.',
          suggestedActionPath: '/reports',
        });
      }

      // Check 3: Cases without assigned lawyer or documents
      const casesWithoutDocs = await db.case.count({
        where: { organizationId, deletedAt: null, documents: { none: {} } },
      });

      if (casesWithoutDocs > 0) {
        recommendations.push({
          id: 'rec-missing-docs',
          type: 'ACTION_REQUIRED',
          title: `يوجد ${casesWithoutDocs} قضية لا تحتوي على أي مستندات مرفقة`,
          description: 'يفضل إضافة اللائحة والعقود الأساسية لاكتمال ملف القضية.',
          suggestedActionPath: '/cases',
        });
      }

      return recommendations;
    });
  }
}
