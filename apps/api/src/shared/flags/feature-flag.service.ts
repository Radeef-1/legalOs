import { Injectable, Logger } from '@nestjs/common';

export interface FeatureFlagConfig {
  flagKey: string;
  enabled: boolean;
  allowedTenants?: string[];
  betaOnly?: boolean;
  description: string;
}

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);

  private readonly featureFlags: Map<string, FeatureFlagConfig> = new Map([
    ['FEATURE_WHITE_LABEL', { flagKey: 'FEATURE_WHITE_LABEL', enabled: true, description: 'تخصيص الهوية والشعار الخاص بمكتب المحاماة' }],
    ['FEATURE_CUSTOM_DOMAIN', { flagKey: 'FEATURE_CUSTOM_DOMAIN', enabled: true, description: 'ربط النطاق الخاص بالمكتب (Custom Domain)' }],
    ['FEATURE_SSO_NATIVE', { flagKey: 'FEATURE_SSO_NATIVE', enabled: true, description: 'الدخول الموحد المؤسسي SSO & SAML 2.0' }],
    ['FEATURE_NAJIZ_DIRECT', { flagKey: 'FEATURE_NAJIZ_DIRECT', enabled: true, description: 'الربط المباشر مع بوابة ناجز لوزارة العدل' }],
    ['FEATURE_AI_COPILOT_PRO', { flagKey: 'FEATURE_AI_COPILOT_PRO', enabled: true, description: 'صياغة المذكرات المتقدمة بالذكاء الاصطناعي' }],
    ['FEATURE_AUTHENTICA_BIOMETRICS', { flagKey: 'FEATURE_AUTHENTICA_BIOMETRICS', enabled: true, description: 'التحقق البيومتري بالوجه والصوت من Authentica.sa' }],
  ]);

  /**
   * Checks if a feature flag is enabled for a given tenant.
   */
  isFeatureEnabled(flagKey: string, tenantId?: string): boolean {
    const flag = this.featureFlags.get(flagKey);
    if (!flag) return false;

    if (!flag.enabled) return false;

    if (flag.allowedTenants && flag.allowedTenants.length > 0) {
      if (!tenantId) return false;
      return flag.allowedTenants.includes(tenantId);
    }

    return true;
  }

  getAllFlags(): FeatureFlagConfig[] {
    return Array.from(this.featureFlags.values());
  }

  toggleFlag(flagKey: string, enabled: boolean): boolean {
    const flag = this.featureFlags.get(flagKey);
    if (flag) {
      flag.enabled = enabled;
      this.logger.log(`[FeatureFlagService] Toggled flag "${flagKey}" to: ${enabled ? 'ENABLED 🟢' : 'DISABLED 🔴'}`);
      return true;
    }
    return false;
  }
}
