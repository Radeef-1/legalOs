import { Injectable, Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextSession {
  tenantId: string;
  userId?: string;
  userRole?: string;
  traceId?: string;
}

@Injectable()
export class TenantContextService {
  private static readonly asyncStorage = new AsyncLocalStorage<TenantContextSession>();
  private readonly logger = new Logger(TenantContextService.name);

  /**
   * Runs a transaction block with a scoped tenant session context
   */
  static run<T>(session: TenantContextSession, callback: () => Promise<T>): Promise<T> {
    return this.asyncStorage.run(session, callback);
  }

  /**
   * Retrieves the current tenant ID from context storage
   */
  static getTenantId(): string | undefined {
    return this.asyncStorage.getStore()?.tenantId;
  }

  /**
   * Retrieves full session metadata including OpenTelemetry Trace ID
   */
  static getSession(): TenantContextSession | undefined {
    return this.asyncStorage.getStore();
  }

  /**
   * Generates PostgreSQL 2026 Transaction-Scoped RLS SET statement.
   * `is_local = true` ensures PgBouncer automatically clears tenant_id on transaction end.
   */
  generateRlsTransactionQuery(tenantId: string): string {
    // Sanitizes tenantId UUID
    const cleanTenantId = tenantId.replace(/[^a-f0-9\-]/gi, '');
    return `SELECT set_config('app.current_tenant_id', '${cleanTenantId}', true);`;
  }
}
