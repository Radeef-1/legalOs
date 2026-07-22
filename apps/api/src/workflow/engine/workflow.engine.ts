import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { WorkflowTriggerType, WorkflowExecutionStatus, ApprovalStatus, WorkflowExecution } from '@prisma/client';

export interface WorkflowNode {
  id: string;
  type: 'CONDITION' | 'CREATE_TASK' | 'SEND_NOTIFICATION' | 'REQUIRE_APPROVAL' | 'CREATE_HEARING' | 'GENERATE_INVOICE';
  title?: string;
  field?: string;
  operator?: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value?: any;
  assignedToId?: string;
  approverId?: string;
  taskTitle?: string;
  message?: string;
}

@Injectable()
export class WorkflowEngine {
  private readonly logger = new Logger(WorkflowEngine.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerWorkflow(triggerType: WorkflowTriggerType, entity: { id: string; type: string; organizationId: string; [key: string]: any }): Promise<WorkflowExecution[]> {
    this.logger.log(`Triggering Workflows for triggerType=${triggerType}, org=${entity.organizationId}, entityId=${entity.id}`);

    const definitions = await this.prisma.db.workflowDefinition.findMany({
      where: {
        organizationId: entity.organizationId,
        triggerType,
        isActive: true,
      },
    });

    const executions: WorkflowExecution[] = [];
    for (const def of definitions) {
      const execution = await this.prisma.db.workflowExecution.create({
        data: {
          organizationId: entity.organizationId,
          workflowDefinitionId: def.id,
          entityId: entity.id,
          entityType: entity.type,
          status: WorkflowExecutionStatus.RUNNING,
          currentStepIndex: 0,
          contextJson: entity as any,
        },
      });

      executions.push(execution);
      // Execute steps asynchronously/immediately
      await this.executeCurrentStep(execution.id);
    }

    return executions;
  }

  async executeCurrentStep(executionId: string): Promise<any> {
    const execution = await this.prisma.db.workflowExecution.findUnique({
      where: { id: executionId },
      include: { definition: true },
    });

    if (!execution || execution.status !== WorkflowExecutionStatus.RUNNING) {
      return;
    }

    const nodes = (execution.definition.nodesJson as unknown as WorkflowNode[]) || [];
    const stepIndex = execution.currentStepIndex;

    if (stepIndex >= nodes.length) {
      // Execution completed!
      this.logger.log(`Workflow Execution ${executionId} completed successfully all ${nodes.length} steps.`);
      return this.prisma.db.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: WorkflowExecutionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    const currentNode = nodes[stepIndex];
    const context = (execution.contextJson as any) || {};

    this.logger.log(`Executing step ${stepIndex} (${currentNode.type}) for execution ${executionId}`);

    try {
      switch (currentNode.type) {
        case 'CONDITION': {
          const fieldValue = context[currentNode.field ?? ''];
          let matches = false;

          if (currentNode.operator === 'EQUALS') {
            matches = fieldValue === currentNode.value;
          } else if (currentNode.operator === 'GREATER_THAN') {
            matches = Number(fieldValue) > Number(currentNode.value);
          } else if (currentNode.operator === 'CONTAINS') {
            matches = String(fieldValue ?? '').includes(String(currentNode.value));
          } else {
            matches = Boolean(fieldValue);
          }

          await this.prisma.db.workflowStepLog.create({
            data: {
              executionId,
              stepIndex,
              nodeType: currentNode.type,
              status: matches ? 'SUCCESS' : 'SKIPPED',
              outputJson: { field: currentNode.field, fieldValue, value: currentNode.value, matches },
            },
          });

          if (matches) {
            // Advance step
            await this.prisma.db.workflowExecution.update({
              where: { id: executionId },
              data: { currentStepIndex: stepIndex + 1 },
            });
            return this.executeCurrentStep(executionId);
          } else {
            // Condition failed, complete workflow early
            return this.prisma.db.workflowExecution.update({
              where: { id: executionId },
              data: { status: WorkflowExecutionStatus.COMPLETED, completedAt: new Date() },
            });
          }
        }

        case 'CREATE_TASK': {
          const task = await this.prisma.db.task.create({
            data: {
              organizationId: execution.organizationId,
              caseId: execution.entityType === 'Case' ? execution.entityId : null,
              assignedToId: currentNode.assignedToId ?? null,
              title: currentNode.taskTitle ?? currentNode.title ?? 'مهمة عمل آلية من مسار النظام',
              description: `مهمة تم إنشاؤها تلقائياً بواسطة مسار العمل [${execution.definition.name}]`,
              status: 'todo',
            },
          });

          await this.prisma.db.workflowStepLog.create({
            data: {
              executionId,
              stepIndex,
              nodeType: currentNode.type,
              status: 'SUCCESS',
              outputJson: { taskId: task.id, title: task.title },
            },
          });

          await this.prisma.db.workflowExecution.update({
            where: { id: executionId },
            data: { currentStepIndex: stepIndex + 1 },
          });

          return this.executeCurrentStep(executionId);
        }

        case 'SEND_NOTIFICATION': {
          await this.prisma.db.workflowStepLog.create({
            data: {
              executionId,
              stepIndex,
              nodeType: currentNode.type,
              status: 'SUCCESS',
              outputJson: { message: currentNode.message ?? 'إشعار آلي من مسار العمل' },
            },
          });

          await this.prisma.db.workflowExecution.update({
            where: { id: executionId },
            data: { currentStepIndex: stepIndex + 1 },
          });

          return this.executeCurrentStep(executionId);
        }

        case 'REQUIRE_APPROVAL': {
          // Pause execution and create approval request
          const approverId = currentNode.approverId;
          if (!approverId) {
            throw new Error(`Node REQUIRE_APPROVAL at step ${stepIndex} missing approverId`);
          }

          const approval = await this.prisma.db.workflowApproval.create({
            data: {
              organizationId: execution.organizationId,
              executionId,
              approverId,
              title: currentNode.title ?? `طلب اعتماد لمسار ${execution.definition.name}`,
              description: `يتطلب مسار العمل موافقتك للاستمرار في إجراءات النظام`,
              status: ApprovalStatus.PENDING,
            },
          });

          await this.prisma.db.workflowStepLog.create({
            data: {
              executionId,
              stepIndex,
              nodeType: currentNode.type,
              status: 'PAUSED',
              outputJson: { approvalId: approval.id, approverId },
            },
          });

          return this.prisma.db.workflowExecution.update({
            where: { id: executionId },
            data: { status: WorkflowExecutionStatus.WAITING_APPROVAL },
          });
        }

        default: {
          await this.prisma.db.workflowExecution.update({
            where: { id: executionId },
            data: { currentStepIndex: stepIndex + 1 },
          });
          return this.executeCurrentStep(executionId);
        }
      }
    } catch (err: any) {
      this.logger.error(`Error executing step ${stepIndex} in workflow execution ${executionId}: ${err.message}`);
      await this.prisma.db.workflowStepLog.create({
        data: {
          executionId,
          stepIndex,
          nodeType: currentNode?.type ?? 'UNKNOWN',
          status: 'FAILED',
          outputJson: { error: err.message },
        },
      });

      return this.prisma.db.workflowExecution.update({
        where: { id: executionId },
        data: { status: WorkflowExecutionStatus.FAILED, completedAt: new Date() },
      });
    }
  }

  async resumeExecution(executionId: string) {
    const execution = await this.prisma.db.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) throw new NotFoundException(`WorkflowExecution ${executionId} not found`);

    this.logger.log(`Resuming execution ${executionId} from step index ${execution.currentStepIndex + 1}`);

    await this.prisma.db.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: WorkflowExecutionStatus.RUNNING,
        currentStepIndex: execution.currentStepIndex + 1,
      },
    });

    return this.executeCurrentStep(executionId);
  }
}
