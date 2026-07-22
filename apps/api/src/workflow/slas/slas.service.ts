import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';

export interface CreateSlaDto {
  workflowDefinitionId: string;
  targetDurationMinutes: number;
  warningThresholdMinutes: number;
  escalateToMemberId?: string;
}

@Injectable()
export class SlasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSlaDto) {
    const tenantId = TenantContext.getTenantId();

    return this.prisma.db.workflowSla.create({
      data: {
        organizationId: tenantId,
        workflowDefinitionId: dto.workflowDefinitionId,
        targetDurationMinutes: dto.targetDurationMinutes,
        warningThresholdMinutes: dto.warningThresholdMinutes,
        escalateToMemberId: dto.escalateToMemberId ?? null,
      },
    });
  }

  async checkOverdueExecutions() {
    const tenantId = TenantContext.getTenantId();

    const runningExecutions = await this.prisma.db.workflowExecution.findMany({
      where: {
        organizationId: tenantId,
        status: 'RUNNING',
      },
      include: {
        definition: {
          include: { slas: true },
        },
      },
    });

    const escalations: Array<{ executionId: string; workflowName: string; overdueMinutes: number; escalateToMemberId?: string }> = [];

    const now = new Date();
    for (const exec of runningExecutions) {
      const sla = exec.definition.slas[0];
      if (!sla) continue;

      const elapsedMinutes = Math.floor((now.getTime() - exec.startedAt.getTime()) / (1000 * 60));
      if (elapsedMinutes > sla.targetDurationMinutes) {
        escalations.push({
          executionId: exec.id,
          workflowName: exec.definition.name,
          overdueMinutes: elapsedMinutes - sla.targetDurationMinutes,
          escalateToMemberId: sla.escalateToMemberId ?? undefined,
        });
      }
    }

    return {
      checkedExecutionsCount: runningExecutions.length,
      overdueCount: escalations.length,
      escalations,
    };
  }
}
