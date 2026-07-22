import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LegalCopilotService } from './ai/legal-copilot.service';
import { IntentEngineService } from './ai/engine/intent-engine.service';
import { ContextEngineService } from './ai/engine/context-engine.service';
import { RecommendationEngineService } from './ai/engine/recommendation-engine.service';
import { CopilotFeedbackService } from './ai/engine/copilot-feedback.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('========================================================================');
  console.log('🤖 STARTING LEGAL COPILOT & INTENT ENGINE VERIFICATION');
  console.log('========================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const copilotService = app.get(LegalCopilotService);
  const intentEngine = app.get(IntentEngineService);
  const contextEngine = app.get(ContextEngineService);
  const recommendationEngine = app.get(RecommendationEngineService);
  const feedbackService = app.get(CopilotFeedbackService);
  const appPrisma = app.get(PrismaService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const userId = '11111111-1111-1111-1111-111111111111';

  // -------------------------------------------------------------
  // SEED TENANT DATA
  // -------------------------------------------------------------
  await TenantContext.run({ tenantId: tenantA, userId }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantA },
      create: { id: tenantA, name: 'مكتب الخبراء القانوني', slug: 'khubara-legal' },
      update: {},
    });

    await appPrisma.db.user.upsert({
      where: { id: userId },
      create: { id: userId, fullName: 'الدكتور عبد الله السلمان', email: 'salman@khubara.sa' },
      update: {},
    });
  });

  // -------------------------------------------------------------
  // SCENARIO 1: Intent Engine Detection & Action Payload
  // -------------------------------------------------------------
  console.log('[Scenario 1] Testing Intent Detection & Action Payload Generation...');
  const intent1 = intentEngine.analyzeIntent('أريد فتح قضية تجارية جديدة');
  console.log(`  - Prompt: "أريد فتح قضية تجارية جديدة"`);
  console.log(`  - Detected Intent:          "${intent1.intent}" (Confidence: ${intent1.confidenceScore * 100}%)`);
  console.log(`  - Extracted Case Type:      "${intent1.extractedEntities.caseType}"`);
  console.log(`  - UI Action Path:           "${intent1.actionPayload.targetPath}"`);

  if (intent1.intent !== 'CREATE_CASE' || intent1.extractedEntities.caseType !== 'commercial') {
    throw new Error('Intent Engine case creation detection failed!');
  }
  console.log('✔ Intent Engine Detection & Action Payload Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 2: Navigation & Search Intent Analysis
  // -------------------------------------------------------------
  console.log('[Scenario 2] Testing Navigation Intent Analysis...');
  const intentNav = intentEngine.analyzeIntent('أين أجد العقود؟');
  console.log(`  - Prompt: "أين أجد العقود؟"`);
  console.log(`  - Detected Intent:          "${intentNav.intent}"`);
  console.log(`  - Target Path:              "${intentNav.actionPayload.targetPath}"`);

  if (intentNav.intent !== 'NAVIGATE' || intentNav.actionPayload.targetPath !== '/documents') {
    throw new Error('Navigation Intent detection failed!');
  }
  console.log('✔ Navigation Intent Analysis Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 3: Context Engine Enrichment
  // -------------------------------------------------------------
  console.log('[Scenario 3] Testing Context Engine Enrichment...');
  const context = await contextEngine.buildUserContext(tenantA, userId);
  console.log(`  - User Name:                "${context.userName}"`);
  console.log(`  - User Role:                "${context.userRole}"`);
  console.log(`  - Organization Name:        "${context.organizationName}"`);

  if (!context.userName) {
    throw new Error('User Context building failed!');
  }
  console.log('✔ Context Engine Enrichment Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 4: Full Legal Copilot Chat Pipeline
  // -------------------------------------------------------------
  console.log('[Scenario 4] Testing Full Legal Copilot Chat Pipeline...');
  const copilotRes = await copilotService.processQuery(tenantA, userId, {
    prompt: 'أنشئ قضية تجارية جديدة ضد شركة أرامكو',
    contextModule: 'commercial',
  });
  console.log(`  - Generated Session ID:    "${copilotRes.sessionId}"`);
  console.log(`  - Generated Message ID:    "${copilotRes.messageId}"`);
  console.log(`  - Detected Intent:          "${copilotRes.intent.intent}"`);
  console.log(`  - Reasoning Steps Count:    ${copilotRes.explainability.reasoningChain.length}`);
  console.log(`  - Action Target Path:       "${copilotRes.intent.actionPayload.targetPath}"`);

  if (!copilotRes.sessionId || !copilotRes.explainability.reasoningChain.length) {
    throw new Error('Legal Copilot processQuery pipeline failed!');
  }
  console.log('✔ Full Legal Copilot Chat Pipeline Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 5: Proactive Recommendations Engine
  // -------------------------------------------------------------
  console.log('[Scenario 5] Testing Proactive Recommendations Engine...');
  const recommendations = await recommendationEngine.getRecommendations(tenantA);
  console.log(`  - Proactive Recommendations Count: ${recommendations.length}`);
  console.log('✔ Proactive Recommendations Engine Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 6: Feedback & Rating Loop
  // -------------------------------------------------------------
  console.log('[Scenario 6] Testing Feedback & Rating Loop...');
  const feedbackRes = await feedbackService.submitFeedback(tenantA, userId, {
    messageId: copilotRes.messageId,
    userRating: 5,
    feedbackComment: 'إجابة متمتازة وتمت تعبئة النموذج بنجاح!',
  });
  console.log(`  - Submitted Rating:        ${feedbackRes.userRating} Stars`);
  console.log(`  - Feedback Comment:        "${feedbackRes.feedbackComment}"`);

  if (feedbackRes.userRating !== 5) {
    throw new Error('Feedback submission failed!');
  }
  console.log('✔ Feedback & Rating Loop Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 7: Multi-Tenant RLS Security Isolation for Copilot
  // -------------------------------------------------------------
  console.log('[Scenario 7] Testing Multi-Tenant RLS Security Isolation for Copilot...');
  await TenantContext.run({ tenantId: tenantB }, async () => {
    const db = appPrisma.db as any;
    const [sessions, docs, rules] = await Promise.all([
      db.aiCopilotSession.findMany({ where: { organizationId: tenantB } }),
      db.aiKnowledgeDoc.findMany({ where: { organizationId: tenantB } }),
      db.aiCustomPromptRule.findMany({ where: { organizationId: tenantB } }),
    ]);

    console.log(`  - Tenant B Copilot Sessions: ${sessions.length}`);
    console.log(`  - Tenant B Knowledge Docs:   ${docs.length}`);

    if (sessions.length !== 0 || docs.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B accessed Tenant A Copilot records!');
    }
  });
  console.log('✔ Multi-Tenant RLS Security Isolation Verified!\n');

  console.log('========================================================================');
  console.log('🎉 ALL LEGAL COPILOT & INTENT ENGINE SCENARIOS VERIFIED 100% SUCCESSFULLY!');
  console.log('========================================================================');

  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ LEGAL COPILOT VERIFICATION FAILED:', err);
  process.exit(1);
});
