import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExpensesService, CreateExpenseDto } from './expenses.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';
import { ExpenseStatus } from '@prisma/client';

@Controller('finance/expenses')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Permissions('finance.expenses.create')
  @CheckPolicy('finance.expenses.create', 'Expense')
  async create(@Body() dto: any) {
    const data = await this.expensesService.create(dto);
    return { success: true, data };
  }

  @Get()
  @Permissions('finance.expenses.view')
  @CheckPolicy('finance.expenses.view', 'Expense')
  async findAll(
    @Query('caseId') caseId?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.expensesService.findAll(caseId, clientId, status as ExpenseStatus);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('finance.expenses.view')
  @CheckPolicy('finance.expenses.view', 'Expense')
  async findOne(@Param('id') id: string) {
    const data = await this.expensesService.findOne(id);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('finance.expenses.delete')
  @CheckPolicy('finance.expenses.delete', 'Expense')
  async remove(@Param('id') id: string) {
    await this.expensesService.remove(id);
    return { success: true, message: 'Expense deleted successfully' };
  }
}
