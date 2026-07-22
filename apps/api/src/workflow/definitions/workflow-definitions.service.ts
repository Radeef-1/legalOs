import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { WorkflowTriggerType } from '@prisma/client';

export interface CreateWorkflowDefinitionDto {
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  entityType: string;
  nodesJson: any[];
}

@Injectable()
export class WorkflowDefinitionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkflowDefinitionDto) {
    const tenantId = TenantContext.getTenantId();
    const userId = TenantContext.getUserId();

    return this.prisma.db.workflowDefinition.create({
      data: {
        organizationId: tenantId,
        name: dto.name,
        description: dto.description ?? null,
        triggerType: dto.triggerType,
        entityType: dto.entityType,
        version: 1,
        isActive: true,
        nodesJson: dto.nodesJson as any,
        createdById: userId ?? null,
      },
    });
  }

  async findAll(triggerType?: WorkflowTriggerType, isActive?: boolean) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.workflowDefinition.findMany({
      where: {
        organizationId: tenantId,
        ...(triggerType ? { triggerType } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = TenantContext.getTenantId();
    const def = await this.prisma.db.workflowDefinition.findFirst({
      where: { id, organizationId: tenantId },
      include: { slas: true },
    });

    if (!def) {
      throw new NotFoundException(`WorkflowDefinition with ID ${id} not found`);
    }

    return def;
  }

  async update(id: string, dto: Partial<CreateWorkflowDefinitionDto> & { isActive?: boolean }) {
    await this.findOne(id);
    return this.prisma.db.workflowDefinition.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.triggerType ? { triggerType: dto.triggerType } : {}),
        ...(dto.entityType ? { entityType: dto.entityType } : {}),
        ...(dto.nodesJson ? { nodesJson: dto.nodesJson as any } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.db.workflowDefinition.delete({ where: { id } });
  }
}
