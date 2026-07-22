import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { TimeTrackingService } from './finance/time-tracking/time-tracking.service';
import { ExpensesService } from './finance/expenses/expenses.service';
import { InvoicesService } from './finance/invoices/invoices.service';
import { TrustAccountsService } from './finance/trust-accounts/trust-accounts.service';
import { FinancialReportsService } from './finance/reports/financial-reports.service';
import { TimeEntryStatus, ExpenseStatus, InvoiceStatus } from '@prisma/client';

async function main() {
  console.log('--- Bootstrapping NestJS Context for Finance Verification ---');
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const timeService = app.get(TimeTrackingService);
  const expenseService = app.get(ExpensesService);
  const invoiceService = app.get(InvoicesService);
  const trustService = app.get(TrustAccountsService);
  const reportService = app.get(FinancialReportsService);

  const tenantAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const partnerAId = '33333333-3333-3333-3333-333333333333';

  await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
    try {
      console.log('\n[1] Setup Test Client and Case');
      const client = await prisma.db.client.create({
        data: {
          organizationId: tenantAId,
          name: 'شركة الخليج للاستشارات المالية',
          nationalIdOrCr: '1010998877',
        },
      });

      const caseItem = await prisma.db.case.create({
        data: {
          organizationId: tenantAId,
          clientId: client.id,
          caseNumberInternal: `FIN-CASE-${Date.now()}`,
          caseType: 'commercial',
          status: 'open',
        },
      });

      const member = await prisma.db.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: tenantAId, userId: partnerAId } },
      });

      if (!member) throw new Error('OrganizationMember not found for partner');

      // ----------------------------------------------------
      // Scenario 1: Billable Hours & Time Entries
      // ----------------------------------------------------
      console.log('\n[2] Scenario 1: Logging Billable Hours');
      const timeEntry = await timeService.create({
        caseId: caseItem.id,
        memberId: member.id,
        description: 'دراسة وتحديد استراتيجية الترافع لمذكرة الدفاع',
        hours: 3.5,
        hourlyRate: 600,
        isBillable: true,
      });

      console.log(`- Created TimeEntry [ID: ${timeEntry.id}]: ${timeEntry.hours} hrs @ ${timeEntry.hourlyRate} SAR = ${timeEntry.totalAmount} SAR (Status: ${timeEntry.status})`);
      if (Number(timeEntry.totalAmount) !== 2100 || timeEntry.status !== TimeEntryStatus.UNBILLED) {
        throw new Error('TimeEntry totalAmount or status calculation failed');
      }

      // ----------------------------------------------------
      // Scenario 2: Case Expenses
      // ----------------------------------------------------
      console.log('\n[3] Scenario 2: Logging Reimbursable Case Expense');
      const expense = await expenseService.create({
        caseId: caseItem.id,
        clientId: client.id,
        memberId: member.id,
        category: 'رسوم محكمة',
        description: 'سداد رسوم القيد والافتتاح للمحكمة التجارية',
        amount: 500,
        vatAmount: 75,
        isBillable: true,
      });

      console.log(`- Created Expense [ID: ${expense.id}]: ${expense.amount} SAR + VAT ${expense.vatAmount} SAR (Status: ${expense.status})`);
      if (Number(expense.amount) !== 500 || expense.status !== ExpenseStatus.UNBILLED) {
        throw new Error('Expense creation or status failed');
      }

      // ----------------------------------------------------
      // Scenario 3: Client Retainer Trust Account Deposit
      // ----------------------------------------------------
      console.log('\n[4] Scenario 3: Deposit Retainer into Client Trust Account');
      const depositRes = await trustService.deposit({
        clientId: client.id,
        caseId: caseItem.id,
        amount: 10000,
        referenceNumber: 'REF-BANK-998877',
        description: 'إيداع عربون أتعاب وتكاليف قضية تجارية',
      });

      console.log(`- Deposited 10,000 SAR into Trust Account. New Balance: ${depositRes.account.balance} SAR`);
      if (Number(depositRes.account.balance) !== 10000) {
        throw new Error('Trust Account deposit balance failed');
      }

      // ----------------------------------------------------
      // Scenario 4: ZATCA Invoice Generation
      // ----------------------------------------------------
      console.log('\n[5] Scenario 4: Issuing ZATCA Compliant Invoice');
      const invoice = await invoiceService.create({
        clientId: client.id,
        caseId: caseItem.id,
        timeEntryIds: [timeEntry.id],
        expenseIds: [expense.id],
        notes: 'يرجى السداد خلال 30 يوم من تاريخ الإصدار',
      });

      console.log(`- Generated Invoice [${invoice.invoiceNumber}]: Subtotal=${invoice.subtotal} SAR, VAT (15%)=${invoice.taxAmount} SAR, Total=${invoice.totalAmount} SAR, BalanceDue=${invoice.balanceDue} SAR`);
      console.log(`- Invoice Status: ${invoice.status}`);

      // Verify item statuses updated to BILLED
      const updatedTimeEntry = await timeService.findOne(timeEntry.id);
      const updatedExpense = await expenseService.findOne(expense.id);

      if (updatedTimeEntry.status !== TimeEntryStatus.BILLED || updatedExpense.status !== ExpenseStatus.BILLED) {
        throw new Error('Invoice creation failed to update time entries / expenses to BILLED status');
      }
      console.log('✔ Time Entries and Expenses automatically marked as BILLED!');

      // ----------------------------------------------------
      // Scenario 5: Trust Draw Settlement
      // ----------------------------------------------------
      console.log('\n[6] Scenario 5: Draw Funds from Retainer Trust Account to Pay Invoice');
      const drawRes = await trustService.drawToInvoice({
        trustAccountId: depositRes.account.id,
        invoiceId: invoice.id,
        amount: Number(invoice.totalAmount),
      });

      console.log(`- Executed Trust Draw of ${invoice.totalAmount} SAR to Invoice ${invoice.invoiceNumber}.`);
      console.log(`- Invoice Paid Amount: ${drawRes.invoice.paidAmount} SAR, Balance Due: ${drawRes.invoice.balanceDue} SAR, Status: ${drawRes.invoice.status}`);

      const updatedTrustAccount = await trustService.getAccountLedger(depositRes.account.id);
      console.log(`- Updated Trust Account Balance: ${updatedTrustAccount.balance} SAR`);

      if (drawRes.invoice.status !== InvoiceStatus.paid || Number(updatedTrustAccount.balance) !== 10000 - Number(invoice.totalAmount)) {
        throw new Error('Trust Draw settlement failed');
      }

      console.log('✔ Invoice fully paid via Trust Draw!');

      // ----------------------------------------------------
      // Scenario 6: Executive Financial Dashboard Reports
      // ----------------------------------------------------
      console.log('\n[7] Scenario 6: Query Executive Financial Dashboard Report');
      const dashboard = await reportService.getExecutiveDashboard();
      console.log('- Financial Executive Dashboard:', JSON.stringify(dashboard, null, 2));

      if (dashboard.totalRevenue < Number(invoice.totalAmount)) {
        throw new Error('Financial Dashboard totalRevenue calculation mismatch');
      }

      // ----------------------------------------------------
      // Scenario 7: Multi-Tenant RLS Security Test
      // ----------------------------------------------------
      console.log('\n[8] Scenario 7: Multi-Tenant RLS Security Isolation Test');
      await TenantContext.run({ tenantId: tenantBId, userId: 'other-user', role: 'Partner' }, async () => {
        const tenantBInvoices = await invoiceService.findAll();
        const tenantBTrust = await prisma.db.trustAccount.findMany({ where: { organizationId: tenantBId } });

        console.log(`- Tenant B Invoices Count: ${tenantBInvoices.length} (Expected: 0 from Tenant A)`);
        console.log(`- Tenant B Trust Accounts Count: ${tenantBTrust.length} (Expected: 0 from Tenant A)`);

        const isIsolated = !tenantBInvoices.some((i) => i.id === invoice.id) && !tenantBTrust.some((t) => t.id === depositRes.account.id);
        if (!isIsolated) {
          throw new Error('SECURITY VIOLATION: Tenant B accessed Tenant A financial records!');
        }
        console.log('✔ Tenant Financial RLS Isolation Verified!');
      });

      console.log('\n✅ All Workspace Finance Domain scenarios verified successfully!');
    } catch (err) {
      console.error('❌ Finance Verification failed:', err);
      process.exit(1);
    } finally {
      await app.close();
    }
  });
}

main();
