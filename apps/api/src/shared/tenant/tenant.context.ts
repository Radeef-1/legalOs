import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextStore {
  tenantId: string;
  userId?: string;
  role?: string;
}

export class TenantContext {
  private static storage = new AsyncLocalStorage<TenantContextStore>();

  static run<T>(store: TenantContextStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  static getStore(): TenantContextStore | undefined {
    return this.storage.getStore();
  }

  static getTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  static getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  static getRole(): string | undefined {
    return this.storage.getStore()?.role;
  }
}
