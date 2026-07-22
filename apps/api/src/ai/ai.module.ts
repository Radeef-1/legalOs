import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PiiMaskerService } from './privacy/pii-masker.service';
import { SaudiLegalRagEngine } from './engine/saudi-legal-rag.engine';
import { AiCircuitBreakerEngine } from './engine/ai-circuit-breaker.engine';
import { PrismaModule } from '../shared/database/prisma.module';
import { IntentEngineService } from './engine/intent-engine.service';
import { ContextEngineService } from './engine/context-engine.service';
import { RecommendationEngineService } from './engine/recommendation-engine.service';
import { CopilotFeedbackService } from './engine/copilot-feedback.service';
import { LegalCopilotService } from './legal-copilot.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [
    AiService,
    PiiMaskerService,
    SaudiLegalRagEngine,
    AiCircuitBreakerEngine,
    IntentEngineService,
    ContextEngineService,
    RecommendationEngineService,
    CopilotFeedbackService,
    LegalCopilotService,
  ],
  exports: [
    AiService,
    PiiMaskerService,
    SaudiLegalRagEngine,
    AiCircuitBreakerEngine,
    IntentEngineService,
    ContextEngineService,
    RecommendationEngineService,
    CopilotFeedbackService,
    LegalCopilotService,
  ],
})
export class AiModule {}
