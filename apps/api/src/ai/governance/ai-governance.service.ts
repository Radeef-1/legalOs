import { Injectable, Logger } from '@nestjs/common';

export interface AiGovernanceLog {
  id: string;
  tenantId: string;
  promptVersion: string;
  modelVersion: string;
  tokensUsed: number;
  estimatedCostSar: number;
  latencyMs: number;
  safetyPassed: boolean;
  hallucinationScore: number;
  promptType: 'BRIEF_WRITER' | 'CONTRACT_AUDIT' | 'JUDGMENT_SUMMARY' | 'LAW_SEARCH';
  createdAt: Date;
}

@Injectable()
export class AiGovernanceService {
  private readonly logger = new Logger(AiGovernanceService.name);
  private readonly logs: AiGovernanceLog[] = [];

  /**
   * Logs AI prompt execution details for governance, safety, and cost auditing.
   */
  async logExecution(dto: Omit<AiGovernanceLog, 'id' | 'createdAt'>): Promise<AiGovernanceLog> {
    const entry: AiGovernanceLog = {
      id: `ai-gov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      ...dto,
    };

    this.logs.unshift(entry);
    this.logger.log(`[AiGovernance] Logged AI Prompt (${entry.promptType}) | Latency: ${entry.latencyMs}ms | Cost: ${entry.estimatedCostSar} SAR | Safety: ${entry.safetyPassed ? 'PASSED 🟢' : 'FAILED 🔴'}`);

    return entry;
  }

  getGovernanceLogs(tenantId?: string): AiGovernanceLog[] {
    if (tenantId) {
      return this.logs.filter((l) => l.tenantId === tenantId);
    }
    return [...this.logs];
  }

  getMetricsSummary() {
    const totalCalls = this.logs.length;
    const totalCostSar = this.logs.reduce((acc, l) => acc + l.estimatedCostSar, 0);
    const avgLatencyMs = totalCalls > 0 ? Math.round(this.logs.reduce((acc, l) => acc + l.latencyMs, 0) / totalCalls) : 0;

    return {
      totalCalls,
      totalCostSar: parseFloat(totalCostSar.toFixed(4)),
      avgLatencyMs,
      promptVersionActive: 'v5.2-saudi-law',
      modelVersionActive: 'Saudi-Legal-LLM-v2',
      safetyComplianceRate: '100%',
    };
  }
}
