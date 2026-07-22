import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../tenant/tenant.context';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        const tenantId = TenantContext.getTenantId();
        const userId = TenantContext.getUserId();

        if (!tenantId) {
          return;
        }

        try {
          let entityType = 'unknown';
          let entityId = '00000000-0000-0000-0000-000000000000';
          const parts = url.split('/');
          
          if (parts.length > 1) {
            entityType = parts[2] || 'unknown';
            if (parts[3] && parts[3].length === 36) {
              entityId = parts[3];
            }
          }

          if (method === 'POST' && response && response.data && response.data.id) {
            entityId = response.data.id;
          }

          const action = `${entityType}.${method.toLowerCase()}`;

          await this.prisma.db.auditLog.create({
            data: {
              organizationId: tenantId,
              userId: userId || null,
              action,
              entityType,
              entityId,
              newValue: body ? JSON.parse(JSON.stringify(body)) : null,
              ipAddress: ip || null,
            },
          });
        } catch (err) {
          console.error('Failed to write audit log:', err);
        }
      }),
    );
  }
}
