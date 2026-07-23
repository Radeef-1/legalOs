import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all published guided product tours and tutorials
   */
  async listTutorials(module?: string, role?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (module) where.module = module;
    if (role && role !== 'ALL') where.role = { in: ['ALL', role] };

    const tutorials = await this.prisma.db.learningTutorial.findMany({
      where,
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return tutorials;
  }

  /**
   * Records or updates user tutorial progress
   */
  async updateProgress(dto: {
    userId: string;
    tutorialId: string;
    completed: boolean;
    lastStep: number;
    durationSec?: number;
  }) {
    const existing = await this.prisma.db.userTutorialProgress.findFirst({
      where: { userId: dto.userId, tutorialId: dto.tutorialId },
    });

    if (existing) {
      return this.prisma.db.userTutorialProgress.update({
        where: { id: existing.id },
        data: {
          completed: dto.completed,
          lastStep: dto.lastStep,
          completedAt: dto.completed ? new Date() : existing.completedAt,
          durationSec: (existing.durationSec || 0) + (dto.durationSec || 0),
        },
      });
    }

    return this.prisma.db.userTutorialProgress.create({
      data: {
        userId: dto.userId,
        tutorialId: dto.tutorialId,
        completed: dto.completed,
        lastStep: dto.lastStep,
        completedAt: dto.completed ? new Date() : null,
        durationSec: dto.durationSec || 0,
      },
    });
  }

  /**
   * Retrieves 10-step onboarding checklist status for an organization
   */
  async getOnboardingChecklist(orgId: string) {
    const defaultSteps = [
      { stepKey: 'create_firm', label: '1️⃣ إنشاء وتأسيس المكتب', defaultCompleted: true },
      { stepKey: 'invite_lawyers', label: '2️⃣ دعوة فريق المحامين والمستشارين', defaultCompleted: true },
      { stepKey: 'upload_logo', label: '3️⃣ رفع شعار وترويسة المكتب', defaultCompleted: true },
      { stepKey: 'create_first_case', label: '4️⃣ تسجيل وإنشاء أول قضية تجارية', defaultCompleted: true },
      { stepKey: 'add_first_client', label: '5️⃣ إضافة ملف أول موكل رسمياً', defaultCompleted: true },
      { stepKey: 'send_invite', label: '6️⃣ إرسال دعوة انضمام آمنة 32-bit', defaultCompleted: true },
      { stepKey: 'test_portal', label: '7️⃣ معاينة بوابة الموكلين التفاعلية', defaultCompleted: true },
      { stepKey: 'setup_sms', label: '8️⃣ ربط توثيق الـ OTP وقناة SMS', defaultCompleted: true },
      { stepKey: 'complete_profile', label: '9️⃣ استكمال بيانات ترخيص وزارة العدل', defaultCompleted: true },
      { stepKey: 'ready', label: '🔟 جاهز للتشغيل الكامل والتنفيذ 🟢', defaultCompleted: true },
    ];

    const records = await this.prisma.db.onboardingChecklist.findMany({
      where: { organizationId: orgId },
    });

    const completedMap = new Map(records.map((r) => [r.stepKey, r.completed]));

    const checklist = defaultSteps.map((step) => ({
      ...step,
      completed: completedMap.has(step.stepKey) ? completedMap.get(step.stepKey)! : step.defaultCompleted,
    }));

    const completedCount = checklist.filter((c) => c.completed).length;
    const progressPercent = Math.round((completedCount / defaultSteps.length) * 100);

    return {
      checklist,
      completedCount,
      totalSteps: defaultSteps.length,
      progressPercent: `${progressPercent}%`,
    };
  }

  /**
   * Toggles onboarding checklist step completion
   */
  async toggleChecklistStep(orgId: string, userId: string, stepKey: string, completed: boolean) {
    const existing = await this.prisma.db.onboardingChecklist.findFirst({
      where: { organizationId: orgId, stepKey },
    });

    if (existing) {
      await this.prisma.db.onboardingChecklist.update({
        where: { id: existing.id },
        data: {
          completed,
          completedBy: userId,
          completedAt: completed ? new Date() : null,
        },
      });
    } else {
      await this.prisma.db.onboardingChecklist.create({
        data: {
          organizationId: orgId,
          stepKey,
          completed,
          completedBy: userId,
          completedAt: completed ? new Date() : null,
        },
      });
    }

    return this.getOnboardingChecklist(orgId);
  }

  /**
   * Retrieves Video Academy lessons
   */
  async listVideos(module?: string) {
    const where: any = {};
    if (module) where.module = module;
    return this.prisma.db.learningVideo.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Retrieves Knowledge Base articles
   */
  async listKnowledgeArticles(module?: string) {
    const where: any = {};
    if (module) where.module = module;
    return this.prisma.db.knowledgeArticle.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }
}
