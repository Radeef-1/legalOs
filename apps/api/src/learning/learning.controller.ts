import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { LearningService } from './services/learning.service';
import { LearningAnalyticsService } from './services/learning-analytics.service';
import { TenantContext } from '../shared/tenant/tenant.context';

@Controller('v1/learning')
export class LearningController {
  constructor(
    private readonly learningService: LearningService,
    private readonly analyticsService: LearningAnalyticsService,
  ) {}

  /**
   * List guided product tours and task tutorials
   */
  @Get('tutorials')
  async listTutorials(@Query('module') module?: string, @Query('role') role?: string) {
    const tutorials = await this.learningService.listTutorials(module, role);
    return { success: true, tutorials };
  }

  /**
   * Update user tutorial progress
   */
  @Post('progress')
  async updateProgress(
    @Body()
    dto: {
      userId?: string;
      tutorialId: string;
      completed: boolean;
      lastStep: number;
      durationSec?: number;
    },
  ) {
    const userId = dto.userId || 'user-admin-01';
    const progress = await this.learningService.updateProgress({
      ...dto,
      userId,
    });
    return { success: true, progress };
  }

  /**
   * Get 10-step onboarding checklist status for current firm
   */
  @Get('checklist')
  async getChecklist() {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    const checklist = await this.learningService.getOnboardingChecklist(orgId);
    return { success: true, ...checklist };
  }

  /**
   * Toggle 10-step onboarding checklist step
   */
  @Post('checklist/toggle')
  async toggleChecklist(
    @Body() dto: { stepKey: string; completed: boolean },
  ) {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    const userId = 'user-admin-01';
    const updated = await this.learningService.toggleChecklistStep(
      orgId,
      userId,
      dto.stepKey,
      dto.completed,
    );
    return { success: true, ...updated };
  }

  /**
   * Video Academy lessons list
   */
  @Get('videos')
  async listVideos(@Query('module') module?: string) {
    const videos = await this.learningService.listVideos(module);
    return { success: true, videos };
  }

  /**
   * Knowledge Base documentation articles
   */
  @Get('articles')
  async listArticles(@Query('module') module?: string) {
    const articles = await this.learningService.listKnowledgeArticles(module);
    return { success: true, articles };
  }

  /**
   * Adoption analytics & completion metrics
   */
  @Get('analytics')
  async getAnalytics() {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    const analytics = await this.analyticsService.getAdoptionAnalytics(orgId);
    return { success: true, analytics };
  }
}
