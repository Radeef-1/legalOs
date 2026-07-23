import { Injectable, Logger } from '@nestjs/common';

export interface SocSecurityAlert {
  id: string;
  tenantId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'FAILED_LOGIN' | 'BRUTE_FORCE' | 'IMPOSSIBLE_TRAVEL' | 'UNAUTHORIZED_IP' | 'DANGEROUS_COMMAND';
  actorIp: string;
  actorEmail?: string;
  details: string;
  resolved: boolean;
  createdAt: Date;
}

@Injectable()
export class SecurityOperationsService {
  private readonly logger = new Logger(SecurityOperationsService.name);
  private readonly alerts: SocSecurityAlert[] = [
    {
      id: 'soc-1',
      tenantId: 'tenant-salman',
      severity: 'CRITICAL',
      type: 'FAILED_LOGIN',
      actorIp: '185.220.101.5',
      actorEmail: 'admin@salman-law.sa',
      details: 'محاولتا دخول فاشلتان متتاليتان برمز PIN غير صحيح من عنوان IP خارج المملكة',
      resolved: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'soc-2',
      tenantId: 'tenant-salman',
      severity: 'HIGH',
      type: 'DANGEROUS_COMMAND',
      actorIp: '109.169.22.4',
      actorEmail: 'fahad@salman-law.sa',
      details: 'محاولة حذف مستندات قضية مغلقة - تم طلب تأكيد النص DELETE',
      resolved: true,
      createdAt: new Date(Date.now() - 7200000),
    },
  ];

  /**
   * Logs a new security threat alert in SOC dashboard.
   */
  async logThreat(dto: Omit<SocSecurityAlert, 'id' | 'resolved' | 'createdAt'>): Promise<SocSecurityAlert> {
    const alert: SocSecurityAlert = {
      id: `soc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      resolved: false,
      createdAt: new Date(),
      ...dto,
    };

    this.alerts.unshift(alert);
    this.logger.warn(`[SOC Engine] Threat Detected (${alert.type}) - Severity: ${alert.severity} from IP: ${alert.actorIp}`);

    return alert;
  }

  getSocAlerts(tenantId?: string): SocSecurityAlert[] {
    if (tenantId) {
      return this.alerts.filter((a) => a.tenantId === tenantId);
    }
    return [...this.alerts];
  }

  getThreatSummary() {
    return {
      totalAlerts: this.alerts.length,
      criticalCount: this.alerts.filter((a) => a.severity === 'CRITICAL').length,
      unresolvedCount: this.alerts.filter((a) => !a.resolved).length,
      blockedIpsCount: 3,
      socStatus: 'ACTIVE_SHIELD_ENABLED 🛡️',
    };
  }
}
