import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PortalClient = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.portalClientId;
  },
);

export const PortalOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.portalOrgId;
  },
);

export const PortalSessionId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.portalSessionId;
  },
);
