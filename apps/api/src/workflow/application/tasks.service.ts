import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateTaskDto } from '../presentation/dto/create-task.dto';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const tenantId = TenantContext.getTenantId()!;

    if (createTaskDto.caseId) {
      const caseItem = await this.prisma.db.case.findFirst({
        where: { id: createTaskDto.caseId, organizationId: tenantId, deletedAt: null },
      });
      if (!caseItem) {
        throw new NotFoundException({
          code: 'CASE_NOT_FOUND',
          message: 'القضية المحددة غير موجودة',
        });
      }
    }

    const created = await this.prisma.db.task.create({
      data: {
        organizationId: tenantId,
        title: createTaskDto.title,
        description: createTaskDto.description || null,
        caseId: createTaskDto.caseId || null,
        assignedToId: createTaskDto.assignedToId || null,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        status: 'todo',
      },
    });

    return created;
  }

  async findAll() {
    const tenantId = TenantContext.getTenantId()!;

    return this.prisma.db.task.findMany({
      where: { organizationId: tenantId },
      include: {
        case: {
          select: {
            id: true,
            caseNumberInternal: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: TaskStatus) {
    const tenantId = TenantContext.getTenantId()!;

    const task = await this.prisma.db.task.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!task) {
      throw new NotFoundException({
        code: 'TASK_NOT_FOUND',
        message: 'المهمة المطلوبة غير موجودة',
      });
    }

    const updated = await this.prisma.db.task.update({
      where: { id },
      data: { status },
    });

    return updated;
  }
}
