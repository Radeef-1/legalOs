import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminSecurityService } from './admin-security.service';

export class VerifyPinDto {
  email: string;
  pin: string;
}

export class ConfirmDangerousCommandDto {
  email: string;
  pin: string;
  confirmText: string;
  commandType: string;
  targetEntity: string;
}

export class ImpersonateTenantDto {
  operatorEmail: string;
  targetTenantId: string;
  targetTenantName: string;
  reason: string;
}

@Controller('admin-security')
export class AdminSecurityController {
  constructor(private readonly adminSecurityService: AdminSecurityService) {}

  @Get('overview')
  async getOverview() {
    const data = this.adminSecurityService.getSecurityOverview();
    return { success: true, data };
  }

  @Post('verify-pin')
  @HttpCode(HttpStatus.OK)
  async verifyPin(@Body() body: VerifyPinDto) {
    const data = this.adminSecurityService.verifyAdminPin(body.email, body.pin);
    return { success: true, data };
  }

  @Post('confirm-dangerous-command')
  @HttpCode(HttpStatus.OK)
  async confirmDangerousCommand(@Body() body: ConfirmDangerousCommandDto) {
    const data = this.adminSecurityService.confirmDangerousCommand(
      body.email,
      body.pin,
      body.confirmText,
      body.commandType,
      body.targetEntity,
    );
    return { success: true, data };
  }

  @Post('impersonate')
  @HttpCode(HttpStatus.OK)
  async impersonate(@Body() body: ImpersonateTenantDto) {
    const data = this.adminSecurityService.startImpersonation(
      body.operatorEmail,
      body.targetTenantId,
      body.targetTenantName,
      body.reason,
    );
    return { success: true, data };
  }

  @Get('audit-vault')
  async getAuditVault() {
    const data = this.adminSecurityService.getAuditVault();
    return { success: true, data };
  }
}
