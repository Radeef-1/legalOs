import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { AuthGuard } from '../../guards/auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';

@Controller('shared/jobs')
@UseGuards(AuthGuard, PermissionsGuard)
export class JobMetricsController {
  constructor(private readonly queueService: QueueService) {}

  @Get('metrics')
  @Permissions('system.jobs.view')
  getQueueMetrics(@Query('queueName') queueName?: string) {
    const metrics = this.queueService.getQueueMetrics(queueName);
    return { success: true, data: metrics };
  }

  @Get(':id')
  @Permissions('system.jobs.view')
  getJobDetails(@Param('id') id: string) {
    const job = this.queueService.getJob(id);
    if (!job) {
      return { success: false, error: 'JOB_NOT_FOUND', message: `Job with ID ${id} not found.` };
    }
    return { success: true, data: job };
  }
}
