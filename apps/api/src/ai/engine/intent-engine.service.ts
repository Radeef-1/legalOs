import { Injectable, Logger } from '@nestjs/common';

export type DetectedIntentType =
  | 'CREATE_CASE'
  | 'NAVIGATE'
  | 'DRAFT_MEMO'
  | 'SEARCH'
  | 'SCHEDULE_HEARING'
  | 'PAY_INVOICE'
  | 'QUERY_ANALYTICS'
  | 'CLIENT_PORTAL_ACTION'
  | 'GENERAL_LEGAL_QUERY';

export interface ActionExecutionPayload {
  actionType: DetectedIntentType;
  targetPath?: string;
  prefillData?: Record<string, any>;
  suggestedCategory?: string;
  uiPromptMessage: string;
}

export interface IntentAnalysisResult {
  intent: DetectedIntentType;
  confidenceScore: number;
  extractedEntities: Record<string, any>;
  actionPayload: ActionExecutionPayload;
}

@Injectable()
export class IntentEngineService {
  private readonly logger = new Logger(IntentEngineService.name);

  /**
   * Analyzes prompt text or voice transcript to detect intent, extract entities, and produce execution payload.
   */
  analyzeIntent(prompt: string, contextModule?: string): IntentAnalysisResult {
    const text = prompt.toLowerCase().trim();

    // 1. Create Case Intent
    if (text.includes('قضية جديدة') || text.includes('أضيف قضية') || text.includes('إنشاء قضية') || text.includes('فتح قضية') || text.includes('create case')) {
      const caseType = text.includes('تجاري') ? 'commercial' : text.includes('عمالي') ? 'labor' : text.includes('تنفيذ') ? 'execution' : 'personal_status';
      return {
        intent: 'CREATE_CASE',
        confidenceScore: 0.95,
        extractedEntities: { caseType, rawPrompt: prompt },
        actionPayload: {
          actionType: 'CREATE_CASE',
          targetPath: '/cases?action=new',
          prefillData: { caseType, status: 'open' },
          suggestedCategory: caseType,
          uiPromptMessage: 'تم التكتشف نية إنشاء قضية جديدة 🪄. سيتم فتح النموذج وتعبئة البيانات المبدئية تلقائياً.',
        },
      };
    }

    // 2. Draft Memo Intent
    if (text.includes('مذكرة') || text.includes('صياغة') || text.includes('لائحة') || text.includes('draft memo')) {
      return {
        intent: 'DRAFT_MEMO',
        confidenceScore: 0.92,
        extractedEntities: { documentType: 'مذكرة جوابية' },
        actionPayload: {
          actionType: 'DRAFT_MEMO',
          targetPath: '/ai-assistant?tab=draft',
          prefillData: { prompt },
          uiPromptMessage: 'تم تفعيل محرك صياغة المذكرات بنظام الـ RAG والأنظمة السعودية 📜.',
        },
      };
    }

    // 3. Navigation Intent
    if (text.includes('أين أجد') || text.includes('افتح') || text.includes('اذهب إلى') || text.includes('navigate')) {
      let targetPath = '/dashboard';
      if (text.includes('عقود') || text.includes('مستندات')) targetPath = '/documents';
      if (text.includes('فواتير') || text.includes('مالية')) targetPath = '/reports';
      if (text.includes('مهام') || text.includes('إجراءات')) targetPath = '/tasks';
      if (text.includes('تقويم') || text.includes('جلسات')) targetPath = '/calendar';

      return {
        intent: 'NAVIGATE',
        confidenceScore: 0.90,
        extractedEntities: { targetPath },
        actionPayload: {
          actionType: 'NAVIGATE',
          targetPath,
          uiPromptMessage: `تم التوجه مباشرة إلى قسم ${targetPath} بناءً على طلبك 🧭.`,
        },
      };
    }

    // 4. Analytics Intent
    if (text.includes('إيرادات') || text.includes('أداء') || text.includes('إنتاجية') || text.includes('analytics')) {
      return {
        intent: 'QUERY_ANALYTICS',
        confidenceScore: 0.88,
        extractedEntities: { metric: 'revenue' },
        actionPayload: {
          actionType: 'QUERY_ANALYTICS',
          targetPath: '/reports',
          uiPromptMessage: 'تم تحليل أداء المكتب وإعداد التقارير المالية والإنتاجية 📊.',
        },
      };
    }

    // 5. Default Query Intent
    return {
      intent: 'GENERAL_LEGAL_QUERY',
      confidenceScore: 0.75,
      extractedEntities: { contextModule: contextModule || 'general' },
      actionPayload: {
        actionType: 'GENERAL_LEGAL_QUERY',
        uiPromptMessage: 'المرشد القانوني يجيب استناداً إلى الأنظمة السعودية وسجلات المكتب ⚖️.',
      },
    };
  }
}
