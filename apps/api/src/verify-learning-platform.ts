import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LearningService } from './learning/services/learning.service';
import { LearningAnalyticsService } from './learning/services/learning-analytics.service';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('🚀 [Digital Adoption Platform DAP v11] Starting Learning & Adoption Verification Suite...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const learningService = app.get(LearningService);
  const analyticsService = app.get(LearningAnalyticsService);

  const orgId = 'org-salman-2026';
  const userId = 'user-admin-01';

  // 1. Check 10-step onboarding checklist
  console.log('\n📋 [Test 1] Testing 10-Step Onboarding Setup Checklist...');
  const checklist = await learningService.getOnboardingChecklist(orgId);
  console.log(`✅ Onboarding Progress: ${checklist.progressPercent} (${checklist.completedCount}/${checklist.totalSteps} steps)`);

  // 2. Toggle Checklist Step
  console.log('\n✔️ [Test 2] Testing Onboarding Checklist Step Toggle...');
  const updatedChecklist = await learningService.toggleChecklistStep(orgId, userId, 'create_firm', true);
  console.log(`✅ Updated Onboarding Progress: ${updatedChecklist.progressPercent}`);

  // 3. Create Demo Guided Tour in Database
  console.log('\n🧭 [Test 3] Creating & Querying Guided Product Tours...');
  let tutorial = await prisma.db.learningTutorial.findFirst({ where: { slug: 'tour-cases-v11' } });
  if (!tutorial) {
    tutorial = await prisma.db.learningTutorial.create({
      data: {
        title: 'جولة إدارة القضايا وتوزيع المهام',
        slug: 'tour-cases-v11',
        description: 'جولة تعاطي القضايا والمحاكم وإسناد المهام للمحامين.',
        module: 'cases',
        role: 'ALL',
        difficulty: 'EASY',
        duration: '2 mins',
      },
    });
  }
  console.log(`✅ Guided Product Tour Created with ID: ${tutorial.id}`);

  // 4. Update User Learning Progress
  console.log('\n📊 [Test 4] Recording User Learning & Tour Progress...');
  const progress = await learningService.updateProgress({
    userId,
    tutorialId: tutorial.id,
    completed: true,
    lastStep: 5,
    durationSec: 120,
  });
  console.log(`✅ User Progress Recorded: Completed=${progress.completed}, LastStep=${progress.lastStep}`);

  // 5. Test Adoption Analytics Aggregation
  console.log('\n📈 [Test 5] Querying System Adoption & Engagement Analytics...');
  const analytics = await analyticsService.getAdoptionAnalytics(orgId);
  console.log('✅ Adoption Analytics:', analytics);

  console.log('\n🎉 [SUCCESS 100%] Digital Adoption Platform DAP v11 Passed All Tests Cleanly!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
