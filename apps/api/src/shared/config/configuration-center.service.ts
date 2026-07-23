import { Injectable, Logger } from '@nestjs/common';

export interface DynamicPlatformConfig {
  key: string;
  category: 'SMS_GATEWAY' | 'EMAIL_GATEWAY' | 'AI_MODEL' | 'STORAGE_R2' | 'AUTHENTICA_OTP';
  value: string;
  isSecret: boolean;
  description: string;
  updatedAt: Date;
}

@Injectable()
export class ConfigurationCenterService {
  private readonly logger = new Logger(ConfigurationCenterService.name);

  private readonly configs: Map<string, DynamicPlatformConfig> = new Map([
    [
      'AUTHENTICA_BASE_URL',
      {
        key: 'AUTHENTICA_BASE_URL',
        category: 'AUTHENTICA_OTP',
        value: 'https://api.authentica.sa/api/v2',
        isSecret: false,
        description: 'رابط خادم Authentica.sa لرسائل الـ OTP في السعودية',
        updatedAt: new Date(),
      },
    ],
    [
      'AI_DEFAULT_MODEL',
      {
        key: 'AI_DEFAULT_MODEL',
        category: 'AI_MODEL',
        value: 'Saudi-Legal-LLM-v2',
        isSecret: false,
        description: 'نموذج الذكاء الاصطناعي الافتراضي للمذكرات والاستشارات',
        updatedAt: new Date(),
      },
    ],
    [
      'R2_BUCKET_NAME',
      {
        key: 'R2_BUCKET_NAME',
        category: 'STORAGE_R2',
        value: 'legalos-prod-vault',
        isSecret: false,
        description: 'اسم حاوية التخزين المشفرة بـ Cloudflare R2',
        updatedAt: new Date(),
      },
    ],
  ]);

  /**
   * Dynamically updates a system configuration key without restarting the API server.
   */
  async updateConfig(key: string, value: string): Promise<DynamicPlatformConfig> {
    const existing = this.configs.get(key);
    if (!existing) {
      throw new Error(`Configuration key "${key}" not found.`);
    }

    existing.value = value;
    existing.updatedAt = new Date();

    this.logger.log(`[ConfigurationCenter] Dynamically updated key "${key}" without server restart 🟢`);
    return existing;
  }

  getAllConfigs(): DynamicPlatformConfig[] {
    return Array.from(this.configs.values());
  }
}
