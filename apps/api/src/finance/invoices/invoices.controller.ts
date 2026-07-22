import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InvoicesService, CreateInvoiceDto } from './invoices.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';
import { InvoiceStatus } from '@prisma/client';

@Controller('finance/invoices')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Permissions('finance.invoices.create')
  @CheckPolicy('finance.invoices.create', 'Invoice')
  async create(@Body() dto: any) {
    const data = await this.invoicesService.create(dto);
    return { success: true, data };
  }

  @Get()
  @Permissions('finance.invoices.view')
  @CheckPolicy('finance.invoices.view', 'Invoice')
  async findAll(
    @Query('clientId') clientId?: string,
    @Query('caseId') caseId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.invoicesService.findAll(clientId, caseId, status as InvoiceStatus);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('finance.invoices.view')
  @CheckPolicy('finance.invoices.view', 'Invoice')
  async findOne(@Param('id') id: string) {
    const data = await this.invoicesService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/status')
  @Permissions('finance.invoices.update')
  @CheckPolicy('finance.invoices.update', 'Invoice')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const data = await this.invoicesService.updateStatus(id, status as InvoiceStatus);
    return { success: true, data };
  }

  @Patch(':id/cancel')
  @Permissions('finance.invoices.cancel')
  @CheckPolicy('finance.invoices.cancel', 'Invoice')
  async cancel(@Param('id') id: string) {
    const data = await this.invoicesService.cancel(id);
    return { success: true, data };
  }
}
