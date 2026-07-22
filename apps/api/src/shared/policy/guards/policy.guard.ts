import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { TenantContext } from '../../tenant/tenant.context';
import { CHECK_POLICY_KEY, CheckPolicyMetadata } from '../decorators/check-policy.decorator';
import { PolicyEngineService } from '../policy.engine';
import { Subject, Resource } from '../types';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly policyEngine: PolicyEngineService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyMeta = this.reflector.getAllAndOverride<CheckPolicyMetadata>(CHECK_POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!policyMeta) {
      return true; // No policy check required for this route
    }

    const tenantId = TenantContext.getTenantId();
    const userId = TenantContext.getUserId();
    const roleName = TenantContext.getRole();

    if (!tenantId || !userId || !roleName) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'غير مصرح للوصول (سياق الهوية مفقود)',
      });
    }

    // Resolve membership details for subject context
    const member = await this.prisma.db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: tenantId,
          userId: userId,
        },
      },
      include: {
        teamMemberships: { where: { leftAt: null } },
      },
    });

    const subject: Subject = {
      userId,
      role: roleName,
      organizationId: tenantId,
      branchId: member?.branchId ?? null,
      departmentId: member?.departmentId ?? null,
      teamIds: member?.teamMemberships?.map((tm) => tm.teamId) ?? [],
    };

    const request = context.switchToHttp().getRequest();
    const resourceId = request.params?.id || request.body?.id;

    let resourceData: Record<string, any> = {};

    // Attempt to fetch the actual entity if an ID is present
    if (resourceId && policyMeta.resourceType) {
      try {
        const modelName = policyMeta.resourceType.charAt(0).toLowerCase() + policyMeta.resourceType.slice(1);
        if ((this.prisma.db as any)[modelName]?.findUnique) {
          const entity = await (this.prisma.db as any)[modelName].findUnique({
            where: { id: resourceId },
          });
          if (entity) {
            resourceData = entity;
          }
        }
      } catch (err) {
        // Fallback to request params/body
      }
    }

    const resource: Resource = {
      type: policyMeta.resourceType,
      id: resourceId,
      ...resourceData,
      ...request.params,
      ...request.body,
    };

    const isAllowed = await this.policyEngine.evaluate(subject, policyMeta.action, resource);

    if (!isAllowed) {
      // Audit log the security access failure
      try {
        await this.prisma.db.auditLog.create({
          data: {
            organizationId: tenantId,
            userId: userId,
            action: 'ACCESS_DENIED',
            entityType: policyMeta.resourceType,
            entityId: resourceId ?? 'N/A',
            newValue: { action: policyMeta.action, reason: 'ABAC_POLICY_VIOLATION' } as any,
          },
        });
      } catch (logErr) {
        // Ignore audit log errors
      }

      throw new ForbiddenException({
        code: 'ABAC_POLICY_VIOLATION',
        message: 'تم رفض الإجراء بواسطة سياسة التحكم في الوصول المستندة إلى الخصائص (ABAC Policy)',
      });
    }

    return true;
  }
}
