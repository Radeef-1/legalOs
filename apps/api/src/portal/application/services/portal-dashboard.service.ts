import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export interface DashboardSummary {
  clientName: string;
  activeCasesCount: number;
  upcomingHearings: { id: string; title: string; hearingDate: Date; caseNumber: string }[];
  pendingActionsCount: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesTotal: number;
  unreadMessagesCount: number;
  pendingDocumentsCount: number;
  nextHearingDate: Date | null;
}

@Injectable()
export class PortalDashboardService {
  private readonly logger = new Logger(PortalDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates all dashboard summary data for a portal client.
   */
  async getDashboardSummary(organizationId: string, clientId: string): Promise<DashboardSummary> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      // Fetch client name
      const client = await db.client.findFirst({
        where: { id: clientId, organizationId },
        select: { name: true },
      });

      // Active cases count
      const activeCases = await db.case.count({
        where: { organizationId, clientId, deletedAt: null, status: { not: 'closed' } },
      });

      // Upcoming hearings (next 30 days)
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingHearings = await db.hearing.findMany({
        where: {
          organizationId,
          case: { clientId, deletedAt: null },
          hearingDate: { gte: now, lte: thirtyDaysLater },
          status: 'SCHEDULED',
        },
        include: {
          case: { select: { caseNumberInternal: true } },
        },
        orderBy: { hearingDate: 'asc' },
        take: 5,
      });

      // Pending actions count
      const pendingActionsCount = await db.clientAction.count({
        where: { organizationId, clientId, status: 'PENDING' },
      });

      // Unpaid invoices
      const unpaidInvoices = await db.invoice.findMany({
        where: {
          organizationId,
          clientId,
          status: { in: ['issued', 'partially_paid', 'overdue'] },
        },
        select: { balanceDue: true },
      });
      const unpaidInvoicesTotal = unpaidInvoices.reduce(
        (sum: number, inv: any) => sum + Number(inv.balanceDue || 0),
        0,
      );

      // Unread messages count
      const unreadMessagesCount = await db.portalMessage.count({
        where: { organizationId, clientId, senderType: 'LAWYER', isRead: false },
      });

      // Pending document actions
      const pendingDocumentsCount = await db.clientAction.count({
        where: {
          organizationId,
          clientId,
          status: 'PENDING',
          actionType: { in: ['UPLOAD_DOCUMENT', 'SIGN_DOCUMENT'] },
        },
      });

      const mappedHearings = upcomingHearings.map((h: any) => ({
        id: h.id,
        title: h.title,
        hearingDate: h.hearingDate,
        caseNumber: h.case?.caseNumberInternal || '',
      }));

      this.logger.log(
        `[Portal Dashboard] Summary generated for Client [${client?.name}] — ${activeCases} cases, ${upcomingHearings.length} hearings`,
      );

      return {
        clientName: client?.name || '',
        activeCasesCount: activeCases,
        upcomingHearings: mappedHearings,
        pendingActionsCount,
        unpaidInvoicesCount: unpaidInvoices.length,
        unpaidInvoicesTotal,
        unreadMessagesCount,
        pendingDocumentsCount,
        nextHearingDate: mappedHearings.length > 0 ? mappedHearings[0].hearingDate : null,
      };
    });
  }
}
