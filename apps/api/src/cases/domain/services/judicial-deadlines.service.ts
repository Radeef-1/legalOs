import { Injectable } from '@nestjs/common';

export enum JudicialDegree {
  FIRST_INSTANCE = 'FIRST_INSTANCE', // المحكمة الابتدائية
  APPEAL = 'APPEAL', // محكمة الاستئناف
  SUPREME_COURT = 'SUPREME_COURT', // المحكمة العليا
  EXECUTION = 'EXECUTION', // محكمة التنفيذ
}

export enum SaudiCourtType {
  COMMERCIAL = 'commercial', // المحكمة التجارية
  LABOR = 'labor', // المحكمة العمالية
  GENERAL = 'general', // المحكمة العامة
  PERSONAL_STATUS = 'personal_status', // محكمة الأحوال الشخصية
  CRIMINAL = 'criminal', // المحكمة الجزائية
  EXECUTION = 'execution', // محكمة التنفيذ
}

export interface JudicialDeadlineCalculation {
  deadlineType: string; // نوع المهلة (استئناف، إيداع مذكرة، اعتراض...)
  lawReference: string; // المادة والنظام المرجعي
  daysAllowed: number; // عدد الأيام النظامية
  dueDate: Date; // تاريخ الاستحقاق النهائي
  isUrgent: boolean; // هل هي مهلة مستعجلة
  remainingDays: number; // الأيام المتبقية
  status: 'PENDING' | 'CRITICAL' | 'EXPIRED'; // حالة المهلة
}

@Injectable()
export class JudicialDeadlinesService {
  /**
   * حساب مهلة الاعتراض على الأحكام (Appeal Deadline)
   */
  calculateAppealDeadline(
    judgmentDate: Date,
    courtType: SaudiCourtType | string,
    isUrgentJudgment: boolean = false,
  ): JudicialDeadlineCalculation {
    const start = new Date(judgmentDate);
    let daysAllowed = 30; // الأصل 30 يوماً في النظام السعودي

    if (isUrgentJudgment) {
      daysAllowed = 10; // الأحكام المستعجلة 10 أيام
    } else if (courtType === SaudiCourtType.COMMERCIAL) {
      daysAllowed = 30; // المحاكم التجارية 30 يوماً
    }

    const dueDate = new Date(start.getTime() + daysAllowed * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let status: 'PENDING' | 'CRITICAL' | 'EXPIRED' = 'PENDING';
    if (remainingDays <= 0) {
      status = 'EXPIRED';
    } else if (remainingDays <= 5) {
      status = 'CRITICAL';
    }

    return {
      deadlineType: 'تقديم لائحة اعتراضية (استئناف)',
      lawReference: isUrgentJudgment
        ? 'المادة 177 - نظام المرافعات الشرعية (الأحكام المستعجلة 10 أيام)'
        : 'المادة 79 - نظام المحاكم التجارية (مهلة الاستئناف 30 يوماً)',
      daysAllowed,
      dueDate,
      isUrgent: isUrgentJudgment,
      remainingDays,
      status,
    };
  }

  /**
   * حساب مهلة إيداع المذكرة الجوابية قبل الجلسة الأولى
   */
  calculatePleadingsDeadline(hearingDate: Date): JudicialDeadlineCalculation {
    const hearing = new Date(hearingDate);
    // نظام المحاكم التجارية يتطلب إيداع المذكرة قبل 3 أيام من الجلسة الأولى على الأقل
    const daysBefore = 3;
    const dueDate = new Date(hearing.getTime() - daysBefore * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let status: 'PENDING' | 'CRITICAL' | 'EXPIRED' = 'PENDING';
    if (remainingDays <= 0) {
      status = 'EXPIRED';
    } else if (remainingDays <= 2) {
      status = 'CRITICAL';
    }

    return {
      deadlineType: 'إيداع المذكرة الجوابية عبر ناجز',
      lawReference: 'المادة 20 - لائحة نظام المحاكم التجارية (قبل الجلسة بـ 3 أيام على الأقل)',
      daysAllowed: daysBefore,
      dueDate,
      isUrgent: false,
      remainingDays,
      status,
    };
  }

  /**
   * حساب مهلة تنفيذ القرار القضائي (المادة 34 تنفيذ)
   */
  calculateExecutionArticle34Deadline(issueDate: Date): JudicialDeadlineCalculation {
    const start = new Date(issueDate);
    const daysAllowed = 5; // المادة 34 تنص على الوفاء خلال 5 أيام
    const dueDate = new Date(start.getTime() + daysAllowed * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let status: 'PENDING' | 'CRITICAL' | 'EXPIRED' = 'PENDING';
    if (remainingDays <= 0) {
      status = 'EXPIRED';
    } else if (remainingDays <= 1) {
      status = 'CRITICAL';
    }

    return {
      deadlineType: 'مهلة الوفاء بالقرار 34 تنفيذ',
      lawReference: 'المادة 34 - نظام التنفيذ (5 أيام للوفاء قبل تطبيق المادة 46)',
      daysAllowed,
      dueDate,
      isUrgent: true,
      remainingDays,
      status,
    };
  }

  /**
   * تحويل التاريخ إلى هجري وميلادي مكتوب بالعربية
   */
  formatDualDate(date: Date): { gregorian: string; hijri: string } {
    const gregStr = date.toLocaleDateString('ar-SA-u-ca-gregory', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const hijriStr = date.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      gregorian: gregStr,
      hijri: hijriStr,
    };
  }
}
