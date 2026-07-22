import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantContext } from '../tenant/tenant.context';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const tenantId = TenantContext.getTenantId();
    const userId = TenantContext.getUserId();

    if (!tenantId || !userId) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'يجب تسجيل الدخول للوصول إلى هذا المورد',
      });
    }

    return true;
  }
}
