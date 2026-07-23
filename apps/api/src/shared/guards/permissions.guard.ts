import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const tenantId = TenantContext.getTenantId();
    const roleName = TenantContext.getRole();

    if (!tenantId || !roleName) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
      });
    }

    // Query database to check if the role has all required permissions.
    // In database, we query role with organizationId = tenantId (or global null).
    let roleWithPermissions: any = null;
    try {
      roleWithPermissions = await this.prisma.db.role.findFirst({
        where: {
          name: roleName,
          OR: [
            { organizationId: tenantId },
            { organizationId: null },
          ],
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    } catch (err) {
      throw new ForbiddenException({
        code: 'PERMISSION_CHECK_FAILED',
        message: 'عذراً، متعذر التحقق من الصلاحيات الأمنية حالياً.',
      });
    }

    if (!roleWithPermissions) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'الدور الخاص بك غير معرف بالنظام',
      });
    }

    const userPermissions = roleWithPermissions.permissions.map(
      (rp: any) => rp.permission.name,
    );

    const hasAll = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAll) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء',
      });
    }

    return true;
  }
}
