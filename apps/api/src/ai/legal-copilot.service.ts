import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { TenantContext } from '../shared/tenant/tenant.context';
import { IntentEngineService, IntentAnalysisResult } from './engine/intent-engine.service';
import { ContextEngineService, UserWorkspaceContext } from './engine/context-engine.service';
import { RecommendationEngineService } from './engine/recommendation-engine.service';
import { SAUDI_REGULATIONS_KB } from './rag/saudi-regulations.data';

export class CopilotChatDto {
  sessionId?: string;
  prompt!: string;
  contextModule?: string;
  caseId?: string;
}

export interface CopilotResponse {
  sessionId: string;
  messageId: string;
  response: string;
  intent: IntentAnalysisResult;
  explainability: {
    referencedRegulations: { title: string; articleNumber: string; summary: string }[];
    reasoningChain: string[];
    userContextSummary: string;
  };
  recommendations: any[];
}

@Injectable()
export class LegalCopilotService {
  private readonly logger = new Logger(LegalCopilotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly intentEngine: IntentEngineService,
    private readonly contextEngine: ContextEngineService,
    private readonly recommendationEngine: RecommendationEngineService,
  ) {}

  /**
   * Main Copilot interaction pipeline: Context -> Intent -> RAG -> Reasoning -> Action Payload -> Persistence.
   */
  async processQuery(organizationId: string, userId: string, dto: CopilotChatDto): Promise<CopilotResponse> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      // 1. Build User Context
      const userContext = await this.contextEngine.buildUserContext(organizationId, userId);

      // 2. Analyze Intent & Generate Action Payload
      const intentResult = this.intentEngine.analyzeIntent(dto.prompt, dto.contextModule);

      // 3. Find Relevant Saudi Regulations RAG
      const matchedRegulation =
        SAUDI_REGULATIONS_KB.find(
          (r) =>
            r.category.toLowerCase() === (dto.contextModule || '').toLowerCase() ||
            dto.prompt.includes(r.title),
        ) || SAUDI_REGULATIONS_KB[0];

      // 4. Synthesize Legal Copilot Response
      const responseText = this.synthesizeResponse(dto.prompt, intentResult, userContext, matchedRegulation);

      // 5. Get Proactive Recommendations
      const recommendations = await this.recommendationEngine.getRecommendations(organizationId);

      // 6. Manage Session & Message Persistence
      let session = dto.sessionId
        ? await db.aiCopilotSession.findFirst({ where: { id: dto.sessionId, organizationId, userId } })
        : null;

      if (!session) {
        session = await db.aiCopilotSession.create({
          data: {
            organizationId,
            userId,
            title: dto.prompt.substring(0, 40) + '...',
            contextModule: dto.contextModule || 'general',
            caseId: dto.caseId || null,
          },
        });
      }

      // Record User Message
      await db.aiCopilotMessage.create({
        data: {
          sessionId: session.id,
          userId,
          sender: 'USER',
          content: dto.prompt,
        },
      });

      // Record Copilot Message
      const explainabilityChain = {
        referencedRegulations: [
          {
            title: matchedRegulation.title,
            articleNumber: matchedRegulation.articleNumber,
            summary: matchedRegulation.content,
          },
        ],
        reasoningChain: [
          `تم اكتشاف نية المستخدم: ${intentResult.intent} بنسبة ثقة ${(intentResult.confidenceScore * 100).toFixed(0)}%`,
          `تم تحليل سياق المستخدم (${userContext.userName} - دور ${userContext.userRole} في ${userContext.organizationName})`,
          `تم البحث في قاعدة الأنظمة السعودية المعتمدة (${matchedRegulation.title})`,
          `تم إعداد الإجراء التشغيلي والمستندات التوضيحية`,
        ],
        userContextSummary: `${userContext.userName} (${userContext.userRole}) - ${userContext.activeCasesCount} قضية نشطة`,
      };

      const copilotMessage = await db.aiCopilotMessage.create({
        data: {
          sessionId: session.id,
          userId,
          sender: 'COPILOT',
          content: responseText,
          intentDetected: intentResult.intent,
          executedAction: intentResult.actionPayload as any,
          explainabilityChain: explainabilityChain as any,
        },
      });

      this.logger.log(
        `[Legal Copilot] Processed query for ${userContext.userName}. Intent: ${intentResult.intent}`,
      );

      return {
        sessionId: session.id,
        messageId: copilotMessage.id,
        response: responseText,
        intent: intentResult,
        explainability: explainabilityChain,
        recommendations,
      };
    });
  }

  private synthesizeResponse(
    prompt: string,
    intent: IntentAnalysisResult,
    context: UserWorkspaceContext,
    regulation: any,
  ): string {
    const greeting = `أهلاً بك أستاذ ${context.userName} (مرشدك القانوني الذكي في ${context.organizationName}).\n`;

    if (intent.intent === 'CREATE_CASE') {
      return `${greeting}
بناءً على طلبك، تم استخراج نية إنشاء قضية جديدة (${intent.extractedEntities.caseType || 'تجاري'}).
لقد قمت بإعداد نموذج إنشاء القضية وتعبئة الحقول المبدئية تلقائياً. يمكنك الضغط على إجراء التنفيذ المباشر لأداء المهمة.

⚖️ **المرجع النظامي المقترح:** ${regulation.title} - ${regulation.articleNumber}`;
    }

    if (intent.intent === 'NAVIGATE') {
      return `${greeting}
تم توجيهك المباشر إلى مسار: \`${intent.actionPayload.targetPath}\`.
أنا جاهز لمساعدتك في أي إجراء داخل هذه الصفحة.`;
    }

    if (intent.intent === 'DRAFT_MEMO') {
      return `${greeting}
تم تفعيل محرك صياغة المذكرات بنظام الـ RAG. 
استناداً إلى **${regulation.title} (${regulation.articleNumber})**:
• تم استخراج النقاط الجوهرية من الأنظمة المرعية.
• المذكرة جاهزة للتنقيح وإبداء التوصيات النظامية.`;
    }

    return `${greeting}
بناءً على الأنظمة السعودية المرعية ومعطيات بيئة العمل الحالية (لديك ${context.activeCasesCount} قضية نشطة و ${context.openTasksCount} مهمة معلقة):
${regulation.summary}

تنبيه: مخرجات المرشد القانوني تخضع لتأكيد ومراجعة المحامي المرخص.`;
  }
}
