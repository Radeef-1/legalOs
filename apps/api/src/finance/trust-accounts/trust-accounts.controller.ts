import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TrustAccountsService, DepositTrustDto, DrawTrustDto } from './trust-accounts.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';

@Controller('finance/trust-accounts')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class TrustAccountsController {
  constructor(private readonly trustAccountsService: TrustAccountsService) {}

  @Post('deposit')
  @Permissions('finance.trust.deposit')
  @CheckPolicy('finance.trust.deposit', 'TrustAccount')
  async deposit(@Body() dto: any) {
    const data = await this.trustAccountsService.deposit(dto);
    return { success: true, data };
  }

  @Post('draw')
  @Permissions('finance.trust.draw')
  @CheckPolicy('finance.trust.draw', 'TrustAccount')
  async drawToInvoice(@Body() dto: any) {
    const data = await this.trustAccountsService.drawToInvoice(dto);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('finance.trust.view')
  @CheckPolicy('finance.trust.view', 'TrustAccount')
  async getLedger(@Param('id') id: string) {
    const data = await this.trustAccountsService.getAccountLedger(id);
    return { success: true, data };
  }
}
