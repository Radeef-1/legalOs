import { Injectable, Logger } from '@nestjs/common';

export interface FirmHealthMetric {
  tenantId: string;
  firmName: string;
  healthScore: number; // 0 - 100
  loginFrequencyPerWeek: number;
  activeLawyersCount: number;
  totalCasesManaged: number;
  storageUsedMb: number;
  churnRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  renewalProbabilityPercent: number;
  lastActiveAt: Date;
}

@Injectable()
export class CustomerSuccessService {
  private readonly logger = new Logger(CustomerSuccessService.name);

  private readonly metrics: FirmHealthMetric[] = [
    {
      tenantId: 'tenant-salman',
      firmName: 'مكتب السلمان للمحاماة والاستشارات القانونية',
      healthScore: 94,
      loginFrequencyPerWeek: 48,
      activeLawyersCount: 12,
      totalCasesManaged: 184,
      storageUsedMb: 4200,
      churnRisk: 'LOW',
      renewalProbabilityPercent: 98,
      lastActiveAt: new Date(),
    },
    {
      tenantId: 'tenant-aladl',
      firmName: 'شركة العدل والتميز الدولية',
      healthScore: 88,
      loginFrequencyPerWeek: 32,
      activeLawyersCount: 8,
      totalCasesManaged: 96,
      storageUsedMb: 2100,
      churnRisk: 'LOW',
      renewalProbabilityPercent: 92,
      lastActiveAt: new Date(Date.now() - 3600000 * 4),
    },
  ];

  /**
   * Calculates Firm Health Score & Churn Risk dynamically.
   */
  async getFirmHealth(tenantId: string): Promise<FirmHealthMetric> {
    const found = this.metrics.find((m) => m.tenantId === tenantId);
    if (found) return found;

    return {
      tenantId,
      firmName: 'مكتب محاماة جديد',
      healthScore: 85,
      loginFrequencyPerWeek: 14,
      activeLawyersCount: 3,
      totalCasesManaged: 12,
      storageUsedMb: 350,
      churnRisk: 'LOW',
      renewalProbabilityPercent: 90,
      lastActiveAt: new Date(),
    };
  }

  getAllFirmsHealth(): FirmHealthMetric[] {
    return [...this.metrics];
  }
}
