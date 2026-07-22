import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export interface CaseTimelineEntry {
  id: string;
  phase: string;
  title: string;
  description: string | null;
  status: string;
  completedAt: Date | null;
  sortOrder: number;
}

export interface CaseProgressResult {
  caseId: string;
  caseNumber: string;
  totalPhases: number;
  completedPhases: number;
  currentPhase: string | null;
  progressPercentage: number;
  lastUpdated: Date | null;
  timeline: CaseTimelineEntry[];
}

export class CreateTimelineEntryDto {
  phase!: string;
  title!: string;
  description?: string;
  status?: string;
  sortOrder?: number;
}

@Injectable()
export class PortalTimelineService {
  private readonly logger = new Logger(PortalTimelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets the case timeline with progress percentage for the client.
   */
  async getCaseTimeline(organizationId: string, clientId: string, caseId: string): Promise<CaseProgressResult> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      // Verify case belongs to client
      const caseItem = await db.case.findFirst({
        where: { id: caseId, organizationId, clientId, deletedAt: null },
        select: { id: true, caseNumberInternal: true },
      });

      if (!caseItem) {
        throw new NotFoundException(`القضية [${caseId}] غير موجودة لهذا العميل.`);
      }

      // Get timeline entries
      const timeline = await db.caseTimeline.findMany({
        where: { organizationId, caseId },
        orderBy: { sortOrder: 'asc' },
      });

      // If no manual timeline exists, generate default phases from case data
      if (timeline.length === 0) {
        return this.generateDefaultTimeline(organizationId, caseId, caseItem.caseNumberInternal);
      }

      const totalPhases = timeline.length;
      const completedPhases = timeline.filter((t: any) => t.status === 'COMPLETED').length;
      const currentPhaseEntry = timeline.find((t: any) => t.status === 'CURRENT');
      const lastCompleted = timeline
        .filter((t: any) => t.completedAt)
        .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

      return {
        caseId,
        caseNumber: caseItem.caseNumberInternal,
        totalPhases,
        completedPhases,
        currentPhase: currentPhaseEntry?.title || null,
        progressPercentage: totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0,
        lastUpdated: lastCompleted?.completedAt || null,
        timeline: timeline.map((t: any) => ({
          id: t.id,
          phase: t.phase,
          title: t.title,
          description: t.description,
          status: t.status,
          completedAt: t.completedAt,
          sortOrder: t.sortOrder,
        })),
      };
    });
  }

  /**
   * Creates a timeline entry for a case (admin/lawyer operation).
   */
  async createTimelineEntry(organizationId: string, caseId: string, dto: CreateTimelineEntryDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.caseTimeline.create({
        data: {
          organizationId,
          caseId,
          phase: dto.phase,
          title: dto.title,
          description: dto.description || null,
          status: dto.status || 'UPCOMING',
          sortOrder: dto.sortOrder || 0,
          completedAt: dto.status === 'COMPLETED' ? new Date() : null,
        },
      });
    });
  }

  /**
   * Generates a default timeline from the case's existing data (hearings, documents, etc).
   */
  private async generateDefaultTimeline(
    organizationId: string,
    caseId: string,
    caseNumber: string,
  ): Promise<CaseProgressResult> {
    const db = this.prisma.db as any;

    const caseItem = await db.case.findFirst({
      where: { id: caseId },
      include: {
        hearings: { orderBy: { hearingDate: 'asc' } },
        documents: { select: { id: true } },
      },
    });

    const defaultPhases = [
      { phase: 'CASE_OPENED', title: 'تم فتح القضية', status: 'COMPLETED', sortOrder: 1 },
      { phase: 'LAWSUIT_FILED', title: 'تم رفع الدعوى', status: caseItem?.najizCaseNumber ? 'COMPLETED' : 'CURRENT', sortOrder: 2 },
      { phase: 'HEARING_SCHEDULED', title: 'تم تحديد جلسة', status: caseItem?.hearings?.length > 0 ? 'COMPLETED' : 'UPCOMING', sortOrder: 3 },
      { phase: 'MEMO_SUBMITTED', title: 'تم تقديم مذكرة', status: caseItem?.documents?.length > 0 ? 'COMPLETED' : 'UPCOMING', sortOrder: 4 },
      { phase: 'VERDICT_ISSUED', title: 'صدر الحكم', status: caseItem?.status === 'resolved' || caseItem?.status === 'closed' ? 'COMPLETED' : 'UPCOMING', sortOrder: 5 },
      { phase: 'EXECUTION', title: 'تنفيذ', status: caseItem?.status === 'closed' ? 'COMPLETED' : 'UPCOMING', sortOrder: 6 },
    ];

    // Find the first non-completed phase and mark it as CURRENT
    let foundCurrent = false;
    for (const phase of defaultPhases) {
      if (phase.status === 'UPCOMING' && !foundCurrent) {
        phase.status = 'CURRENT';
        foundCurrent = true;
      }
    }

    const completedPhases = defaultPhases.filter((p) => p.status === 'COMPLETED').length;

    return {
      caseId,
      caseNumber,
      totalPhases: defaultPhases.length,
      completedPhases,
      currentPhase: defaultPhases.find((p) => p.status === 'CURRENT')?.title || null,
      progressPercentage: Math.round((completedPhases / defaultPhases.length) * 100),
      lastUpdated: caseItem?.openedAt || null,
      timeline: defaultPhases.map((p, idx) => ({
        id: `default-${idx}`,
        ...p,
        description: null,
        completedAt: p.status === 'COMPLETED' ? caseItem?.openedAt : null,
      })),
    };
  }
}
