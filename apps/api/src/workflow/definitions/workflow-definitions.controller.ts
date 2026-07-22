import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkflowDefinitionsService } from './workflow-definitions.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';
import { WorkflowTriggerType } from '@prisma/client';

@Controller('workflow/definitions')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class WorkflowDefinitionsController {
  constructor(private readonly definitionsService: WorkflowDefinitionsService) {}

  @Post()
  @Permissions('workflow.definitions.create')
  @CheckPolicy('workflow.definitions.create', 'WorkflowDefinition')
  async create(@Body() dto: any) {
    const data = await this.definitionsService.create(dto);
    return { success: true, data };
  }

  @Get()
  @Permissions('workflow.definitions.view')
  @CheckPolicy('workflow.definitions.view', 'WorkflowDefinition')
  async findAll(@Query('triggerType') triggerType?: string, @Query('isActive') isActive?: string) {
    const data = await this.definitionsService.findAll(
      triggerType as WorkflowTriggerType,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('workflow.definitions.view')
  @CheckPolicy('workflow.definitions.view', 'WorkflowDefinition')
  async findOne(@Param('id') id: string) {
    const data = await this.definitionsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @Permissions('workflow.definitions.update')
  @CheckPolicy('workflow.definitions.update', 'WorkflowDefinition')
  async update(@Param('id') id: string, @Body() dto: any) {
    const data = await this.definitionsService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('workflow.definitions.delete')
  @CheckPolicy('workflow.definitions.delete', 'WorkflowDefinition')
  async remove(@Param('id') id: string) {
    await this.definitionsService.remove(id);
    return { success: true, message: 'Workflow definition deleted successfully' };
  }
}
