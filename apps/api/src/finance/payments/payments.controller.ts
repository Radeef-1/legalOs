import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PaymentsService, RecordPaymentDto } from './payments.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';

@Controller('finance/payments')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Permissions('finance.payments.create')
  @CheckPolicy('finance.payments.create', 'Payment')
  async recordPayment(@Body() dto: any) {
    const data = await this.paymentsService.recordPayment(dto);
    return { success: true, data };
  }

  @Get()
  @Permissions('finance.payments.view')
  @CheckPolicy('finance.payments.view', 'Payment')
  async findAll(@Query('invoiceId') invoiceId?: string) {
    const data = await this.paymentsService.findAll(invoiceId);
    return { success: true, data };
  }
}
