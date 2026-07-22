import { Injectable, Logger } from '@nestjs/common';

export type AiProviderType = 'SAUDI_LOCAL_LLM' | 'CLAUDE_3_5' | 'GPT_4O';

export interface AiCircuitState {
  provider: AiProviderType;
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: Date;
  avgLatencyMs: number;
}

@Injectable()
export class AiCircuitBreakerEngine {
  private readonly logger = new Logger(AiCircuitBreakerEngine.name);

  private readonly providersState: Record<AiProviderType, AiCircuitState> = {
    SAUDI_LOCAL_LLM: { provider: 'SAUDI_LOCAL_LLM', status: 'CLOSED', failureCount: 0, avgLatencyMs: 240 },
    CLAUDE_3_5: { provider: 'CLAUDE_3_5', status: 'CLOSED', failureCount: 0, avgLatencyMs: 850 },
    GPT_4O: { provider: 'GPT_4O', status: 'CLOSED', failureCount: 0, avgLatencyMs: 920 },
  };

  private readonly failureThreshold = 3;
  private readonly recoveryTimeoutMs = 15000;

  /**
   * Executes AI Prompt call with Automatic Circuit Breaker & Saudi Local LLM Failover
   */
  async executeWithCircuitBreaker<T>(
    preferredProvider: AiProviderType,
    aiTask: (provider: AiProviderType) => Promise<T>,
  ): Promise<{ result: T; activeProvider: AiProviderType; failedOver: boolean }> {
    const currentState = this.providersState[preferredProvider];

    // Check if preferred provider circuit is OPEN (Tripped due to errors/slowness)
    let providerToUse = preferredProvider;
    let failedOver = false;

    if (currentState.status === 'OPEN') {
      const timeSinceFailure = Date.now() - (currentState.lastFailureTime?.getTime() || 0);
      if (timeSinceFailure > this.recoveryTimeoutMs) {
        currentState.status = 'HALF_OPEN';
        this.logger.warn(`[AiCircuitBreakerEngine] Testing Provider ${preferredProvider} in HALF_OPEN state.`);
      } else {
        // Fallback directly to Saudi Local Cloud LLM
        providerToUse = 'SAUDI_LOCAL_LLM';
        failedOver = true;
        this.logger.warn(
          `[AiCircuitBreakerEngine] Provider ${preferredProvider} circuit OPEN. Auto-failing over to [SAUDI_LOCAL_LLM]`,
        );
      }
    }

    const startTime = Date.now();
    try {
      const result = await aiTask(providerToUse);
      const latency = Date.now() - startTime;

      // Update provider metrics
      this.recordSuccess(providerToUse, latency);
      return { result, activeProvider: providerToUse, failedOver };
    } catch (err: any) {
      this.recordFailure(providerToUse);

      // If preferred provider failed, attempt instant failover to Saudi Local LLM
      if (providerToUse !== 'SAUDI_LOCAL_LLM') {
        this.logger.error(
          `[AiCircuitBreakerEngine] Primary provider ${providerToUse} threw error: ${err?.message}. Executing emergency failover to SAUDI_LOCAL_LLM`,
        );
        const fallbackResult = await aiTask('SAUDI_LOCAL_LLM');
        return { result: fallbackResult, activeProvider: 'SAUDI_LOCAL_LLM', failedOver: true };
      }

      throw err;
    }
  }

  private recordSuccess(provider: AiProviderType, latencyMs: number) {
    const state = this.providersState[provider];
    state.failureCount = 0;
    state.status = 'CLOSED';
    state.avgLatencyMs = Math.round((state.avgLatencyMs + latencyMs) / 2);
  }

  private recordFailure(provider: AiProviderType) {
    const state = this.providersState[provider];
    state.failureCount++;
    state.lastFailureTime = new Date();

    if (state.failureCount >= this.failureThreshold) {
      state.status = 'OPEN';
      this.logger.error(
        `[AiCircuitBreakerEngine] Circuit TRIPPED OPEN for Provider ${provider} after ${state.failureCount} consecutive failures!`,
      );
    }
  }

  getCircuitStates(): Record<AiProviderType, AiCircuitState> {
    return this.providersState;
  }
}
