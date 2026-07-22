import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationDispatcher } from './notification.dispatcher';

@Injectable()
export class NotificationEventListener implements OnModuleInit {
  private readonly logger = new Logger(NotificationEventListener.name);

  constructor(private readonly notificationDispatcher: NotificationDispatcher) {}

  onModuleInit() {
    this.logger.log('NotificationEventListener initialized and ready for Event Bus dispatch.');
  }

  async handleHearingScheduledEvent(payload: {
    tenantId: string;
    userId: string;
    caseNumber?: string;
    courtName?: string;
    hearingDate?: string;
  }) {
    this.logger.log(`Received HearingScheduledEvent for user ${payload.userId}`);
    return this.notificationDispatcher.dispatch({
      organizationId: payload.tenantId,
      userId: payload.userId,
      title: 'تذكير بموعد جلسة قضائية جديدة',
      body: `تم تحديد موعد جلسة قضائية جديدة للقضية ${payload.caseNumber || ''}`,
      notificationType: NotificationType.HEARING_REMINDER,
      metadata: payload,
    });
  }

  async handleInvoiceIssuedEvent(payload: {
    tenantId: string;
    userId: string;
    invoiceNumber?: string;
    totalAmount?: number;
  }) {
    this.logger.log(`Received InvoiceIssuedEvent for invoice ${payload.invoiceNumber}`);
    return this.notificationDispatcher.dispatch({
      organizationId: payload.tenantId,
      userId: payload.userId,
      title: 'تم إصدار فاتورة خدمات قانونية جديدة',
      body: `تم إصدار الفاتورة رقم ${payload.invoiceNumber || ''} بمبلغ ${payload.totalAmount || 0} ر.س`,
      notificationType: NotificationType.INVOICE_ISSUED,
      metadata: payload,
    });
  }

  async handleWorkflowApprovalRequestedEvent(payload: {
    tenantId: string;
    userId: string;
    approvalId: string;
    processName?: string;
  }) {
    this.logger.log(`Received WorkflowApprovalRequestedEvent [ID: ${payload.approvalId}]`);
    return this.notificationDispatcher.dispatch({
      organizationId: payload.tenantId,
      userId: payload.userId,
      title: 'طلب اعتماد تشغيلي يحتاج موافقتكم',
      body: `يرجى مراجعة طلب الاعتماد لمسار ${payload.processName || 'التشغيلي'} والموافقة عليه`,
      notificationType: NotificationType.WORKFLOW_APPROVAL_REQUIRED,
      metadata: payload,
    });
  }
}
