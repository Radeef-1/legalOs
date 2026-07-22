import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WorkflowEngine } from './workflow.engine';
import { WorkflowTriggerType } from '@prisma/client';

@Injectable()
export class WorkflowEventListener implements OnModuleInit {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(private readonly workflowEngine: WorkflowEngine) {}

  onModuleInit() {
    this.logger.log('WorkflowEventListener initialized and subscribed to Event Bus.');
  }

  async handleCaseCreatedEvent(payload: { caseId: string; organizationId: string; caseType: string; caseNumberInternal: string }) {
    this.logger.log(`Received CaseCreatedEvent for case ${payload.caseId}`);
    return this.workflowEngine.triggerWorkflow(WorkflowTriggerType.CASE_CREATED, {
      id: payload.caseId,
      type: 'Case',
      organizationId: payload.organizationId,
      caseType: payload.caseType,
      caseNumberInternal: payload.caseNumberInternal,
    });
  }

  async handleHearingCompletedEvent(payload: { hearingId: string; organizationId: string; caseId: string }) {
    this.logger.log(`Received HearingCompletedEvent for hearing ${payload.hearingId}`);
    return this.workflowEngine.triggerWorkflow(WorkflowTriggerType.HEARING_COMPLETED, {
      id: payload.hearingId,
      type: 'Hearing',
      organizationId: payload.organizationId,
      caseId: payload.caseId,
    });
  }

  async handleInvoiceOverdueEvent(payload: { invoiceId: string; organizationId: string; amount: number }) {
    this.logger.log(`Received InvoiceOverdueEvent for invoice ${payload.invoiceId}`);
    return this.workflowEngine.triggerWorkflow(WorkflowTriggerType.INVOICE_OVERDUE, {
      id: payload.invoiceId,
      type: 'Invoice',
      organizationId: payload.organizationId,
      amount: payload.amount,
    });
  }
}
