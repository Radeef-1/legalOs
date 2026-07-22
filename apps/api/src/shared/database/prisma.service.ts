import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from '../tenant/tenant.context';
import { AsyncLocalStorage } from 'async_hooks';

const rlsStorage = new AsyncLocalStorage<boolean>();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.warn('PrismaService: Database offline or unreachable:', (error as Error)?.message || error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  get db() {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId || rlsStorage.getStore()) {
      return this;
    }

    return this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args }) => {
            return rlsStorage.run(true, () => {
              return this.$transaction(async (tx) => {
                await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}';`);
                const modelKey = model ? model.charAt(0).toLowerCase() + model.slice(1) : '';
                const targetModel = (tx as any)[modelKey] || (tx as any)[model];
                if (targetModel && targetModel[operation]) {
                  return targetModel[operation](args);
                }
                return (this as any)[modelKey || model]?.[operation]?.(args);
              });
            });
          },
        },
      },
    }) as any;
  }
}
