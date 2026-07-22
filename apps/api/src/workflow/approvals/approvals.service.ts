import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { ApprovalStatus, WorkflowExecutionStatus } from '@prisma/client';
import { WorkflowEngine } from '../engine/workflow.engine';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WorkflowEngine))
    private readonly workflowEngine: WorkflowEngine,
  ) {}

  async findPendingForApprover(approverId: string) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.workflowApproval.findMany({
      where: {
        organizationId: tenantId,
        approverId,
        status: ApprovalStatus.PENDING,
      },
      include: {
        execution: {
          include: {
            definition: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async decide(approvalId: string, status: 'APPROVED' | 'REJECTED', comments?: string) {
    const tenantId = TenantContext.getTenantId();
    const approval = await this.prisma.db.workflowApproval.findFirst({
      where: { id: approvalId, organizationId: tenantId },
      include: { execution: true },
    });

    if (!approval) {
      throw new NotFoundException(`Approval request with ID ${approvalId} not found`);
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(`Approval request ${approvalId} has already been ${approval.status}`);
    }

    const updatedApproval = await this.prisma.db.workflowApproval.update({
      where: { id: approvalId },
      data: {
        status: status === 'APPROVED' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
        comments: comments ?? null,
        decidedAt: new Date(),
      },
    });

    if (status === 'APPROVED') {
      // Resume workflow execution!
      await this.prisma.db.workflowExecution.update({
        where: { id: approval.executionId },
        data: { status: WorkflowExecutionStatus.RUNNING },
      });

      // Resume workflow DAG step evaluation starting from next step
      await this.workflowEngine.resumeExecution(approval.executionId);
    } else {
      // Cancel workflow execution
      await this.prisma.db.workflowExecution.update({
        where: { id: approval.executionId },
        data: { status: WorkflowExecutionStatus.CANCELLED, completedAt: new Date() },
      });
    }

    return updatedApproval;
  }
}
