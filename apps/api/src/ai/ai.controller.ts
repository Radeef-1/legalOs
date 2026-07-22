import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '../shared/guards/auth.guard';
import { AiService } from './ai.service';
import type { SummarizeDto, DraftMemoDto, ContractAnalysisDto } from './ai.service';
import { LegalCopilotService, CopilotChatDto } from './legal-copilot.service';
import { IntentEngineService } from './engine/intent-engine.service';
import { RecommendationEngineService } from './engine/recommendation-engine.service';
import { CopilotFeedbackService, SubmitFeedbackDto } from './engine/copilot-feedback.service';
import { TenantContext } from '../shared/tenant/tenant.context';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly copilotService: LegalCopilotService,
    private readonly intentEngine: IntentEngineService,
    private readonly recommendationEngine: RecommendationEngineService,
    private readonly feedbackService: CopilotFeedbackService,
  ) {}

  @Post('summarize')
  async summarize(@Body() dto: SummarizeDto) {
    const orgId = TenantContext.getTenantId() || '';
    const userId = TenantContext.getUserId() || '';
    return this.aiService.summarize(orgId, userId, dto);
  }

  @Post('draft-memo')
  async draftMemo(@Body() dto: DraftMemoDto) {
    const orgId = TenantContext.getTenantId() || '';
    const userId = TenantContext.getUserId() || '';
    return this.aiService.draftMemo(orgId, userId, dto);
  }

  @Post('analyze-contract')
  async analyzeContract(@Body() dto: ContractAnalysisDto) {
    const orgId = TenantContext.getTenantId() || '';
    const userId = TenantContext.getUserId() || '';
    return this.aiService.analyzeContract(orgId, userId, dto);
  }

  @Get('logs')
  async getLogs() {
    const orgId = TenantContext.getTenantId() || '';
    return this.aiService.getLogs(orgId);
  }

  // ─── LEGAL COPILOT & INTENT ENGINE ENDPOINTS ─────────────────────

  @Post('copilot/chat')
  async copilotChat(@Body() dto: CopilotChatDto) {
    const orgId = TenantContext.getTenantId() || '';
    const userId = TenantContext.getUserId() || '';
    const result = await this.copilotService.processQuery(orgId, userId, dto);
    return { success: true, data: result };
  }

  @Post('copilot/intent')
  async analyzeIntent(@Body('prompt') prompt: string, @Body('contextModule') contextModule?: string) {
    const result = this.intentEngine.analyzeIntent(prompt, contextModule);
    return { success: true, data: result };
  }

  @Get('copilot/recommendations')
  async getRecommendations() {
    const orgId = TenantContext.getTenantId() || '';
    const recommendations = await this.recommendationEngine.getRecommendations(orgId);
    return { success: true, data: recommendations };
  }

  @Post('copilot/feedback')
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    const orgId = TenantContext.getTenantId() || '';
    const userId = TenantContext.getUserId() || '';
    const updated = await this.feedbackService.submitFeedback(orgId, userId, dto);
    return { success: true, data: updated };
  }
}
