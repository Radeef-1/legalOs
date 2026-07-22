import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class PlansService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.seedDefaultPlans();
    } catch (err) {
      console.warn('PlansService: Could not seed default plans because database is offline.');
    }
  }

  async seedDefaultPlans() {
    const defaultPlans = [
      {
        code: SubscriptionTier.STARTER,
        nameAr: 'الباقة المبتدئة',
        nameEn: 'Starter Plan',
        monthlyPriceSar: 299.0,
        annualPriceSar: 2990.0,
        maxSeats: 5,
        maxCases: 100,
        featuresJson: ['BASIC_CASES', 'CRM_CLIENTS', 'DOCUMENTS'],
      },
      {
        code: SubscriptionTier.PROFESSIONAL,
        nameAr: 'الباقة المحترفة',
        nameEn: 'Professional Plan',
        monthlyPriceSar: 799.0,
        annualPriceSar: 7990.0,
        maxSeats: 20,
        maxCases: 999999,
        featuresJson: ['BASIC_CASES', 'CRM_CLIENTS', 'DOCUMENTS', 'WORKFLOW_BPM', 'NOTIFICATIONS', 'FINANCE_SUITE', 'CALENDAR_SYNC'],
      },
      {
        code: SubscriptionTier.ENTERPRISE,
        nameAr: 'الباقة المؤسسية',
        nameEn: 'Enterprise Plan',
        monthlyPriceSar: 1999.0,
        annualPriceSar: 19990.0,
        maxSeats: 999999,
        maxCases: 999999,
        featuresJson: [
          'BASIC_CASES',
          'CRM_CLIENTS',
          'DOCUMENTS',
          'WORKFLOW_BPM',
          'NOTIFICATIONS',
          'FINANCE_SUITE',
          'CALENDAR_SYNC',
          'ABAC_POLICY_ENGINE',
          'BACKGROUND_JOBS',
          'FULL_TEXT_SEARCH',
          'DEDICATED_SUPPORT',
        ],
      },
    ];

    for (const plan of defaultPlans) {
      await (this.prisma as any).subscriptionPlan.upsert({
        where: { code: plan.code },
        create: plan,
        update: {
          nameAr: plan.nameAr,
          nameEn: plan.nameEn,
          monthlyPriceSar: plan.monthlyPriceSar,
          annualPriceSar: plan.annualPriceSar,
          maxSeats: plan.maxSeats,
          maxCases: plan.maxCases,
          featuresJson: plan.featuresJson,
        },
      });
    }
  }

  async getAllPlans() {
    return (this.prisma as any).subscriptionPlan.findMany({
      orderBy: { monthlyPriceSar: 'asc' },
    });
  }

  async getPlanByCode(code: SubscriptionTier) {
    return (this.prisma as any).subscriptionPlan.findUnique({
      where: { code },
    });
  }
}
