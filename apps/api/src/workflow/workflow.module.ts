import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { TasksService } from './application/tasks.service';
import { TasksController } from './presentation/tasks.controller';
import { WorkflowDefinitionsService } from './definitions/workflow-definitions.service';
import { WorkflowDefinitionsController } from './definitions/workflow-definitions.controller';
import { ApprovalsService } from './approvals/approvals.service';
import { ApprovalsController } from './approvals/approvals.controller';
import { SlasService } from './slas/slas.service';
import { SlasController } from './slas/slas.controller';
import { WorkflowEngine } from './engine/workflow.engine';
import { WorkflowEventListener } from './engine/workflow-event.listener';

@Module({
  imports: [PrismaModule],
  controllers: [
    TasksController,
    WorkflowDefinitionsController,
    ApprovalsController,
    SlasController,
  ],
  providers: [
    TasksService,
    WorkflowDefinitionsService,
    ApprovalsService,
    SlasService,
    WorkflowEngine,
    WorkflowEventListener,
  ],
  exports: [
    TasksService,
    WorkflowDefinitionsService,
    ApprovalsService,
    SlasService,
    WorkflowEngine,
    WorkflowEventListener,
  ],
})
export class WorkflowModule {}
