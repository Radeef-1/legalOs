import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExecutiveAnalyticsService } from './reports/application/services/executive-analytics.service';
import { LawyerPerformanceService } from './reports/application/services/lawyer-performance.service';
import { ZatcaTaxReportService } from './reports/application/services/zatca-tax-report.service';
import { ReportExportService } from './reports/application/services/report-export.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('--- STARTING ENTERPRISE BI & REPORTING DOMAIN (PHASE 22) VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const executiveService = app.get(ExecutiveAnalyticsService);
  const lawyerService = app.get(LawyerPerformanceService);
  const zatcaService = app.get(ZatcaTaxReportService);
  const exportService = app.get(ReportExportService);
  const appPrisma = app.get(PrismaService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const clientId = '99999999-9999-9999-9999-999999999999';
  const invoiceId = '44444444-4444-4444-4444-444444444444';
  const lawyerId = '33333333-3333-3333-3333-333333333333';
  const memberId = '22222222-2222-2222-2222-222222222222';
  const roleId = '11111111-1111-1111-1111-111111111111';

  // -------------------------------------------------------------
  // SEED DATA FOR TENANT A BI ANALYTICS
  // -------------------------------------------------------------
  await TenantContext.run({ tenantId: tenantA }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantA },
      create: { id: tenantA, name: 'Enterprise Law Firm A', slug: 'bi-firm-a' },
      update: {},
    });

    await appPrisma.db.user.upsert({
      where: { id: lawyerId },
      create: {
        id: lawyerId,
        email: 'partner.lawyer@lawfirm-a.sa',
        fullName: 'عبدالله الغامدي',
      },
      update: {},
    });

    const lawyerRole = await appPrisma.db.role.upsert({
      where: { id: roleId },
      create: {
        id: roleId,
        organizationId: tenantA,
        name: 'LAWYER',
      },
      update: {},
    });

    let member = await (appPrisma.db as any).organizationMember.findFirst({
      where: { organizationId: tenantA, userId: lawyerId },
    });

    if (!member) {
      member = await (appPrisma.db as any).organizationMember.create({
        data: {
          id: memberId,
          organization: { connect: { id: tenantA } },
          user: { connect: { id: lawyerId } },
          role: { connect: { id: lawyerRole.id } },
        },
      });
    }

    await appPrisma.db.client.upsert({
      where: { id: clientId },
      create: {
        id: clientId,
        organizationId: tenantA,
        name: 'مجموعة الاستثمار الذهبية',
        nationalIdOrCr: '7001928374',
      },
      update: {},
    });

    let biCase = await (appPrisma.db as any).case.findFirst({
      where: { organizationId: tenantA, clientId },
    });

    if (!biCase) {
      biCase = await (appPrisma.db as any).case.create({
        data: {
          organizationId: tenantA,
          clientId,
          assignedLawyerId: lawyerId,
          caseNumberInternal: `BI-CASE-${Date.now()}`,
          caseType: 'commercial',
          status: 'open',
        },
      });
    }

    await appPrisma.db.invoice.upsert({
      where: { id: invoiceId },
      create: {
        id: invoiceId,
        organizationId: tenantA,
        clientId,
        caseId: biCase.id,
        invoiceNumber: 'INV-BI-2026-001',
        subtotal: 10000.0,
        taxAmount: 1500.0,
        totalAmount: 11500.0,
        paidAmount: 11500.0,
        balanceDue: 0.0,
        status: 'paid',
      },
      update: {
        subtotal: 10000.0,
        taxAmount: 1500.0,
        totalAmount: 11500.0,
        paidAmount: 11500.0,
        balanceDue: 0.0,
        status: 'paid',
      },
    });

    await appPrisma.db.timeEntry.create({
      data: {
        organization: { connect: { id: tenantA } },
        member: { connect: { id: member.id } },
        case: { connect: { id: biCase.id } },
        description: 'إعداد اللائحة والترافع أمام المحكمة التجارية',
        hours: 12.5,
        hourlyRate: 800.0,
        totalAmount: 10000.0,
        isBillable: true,
      },
    });

    await appPrisma.db.expense.create({
      data: {
        organization: { connect: { id: tenantA } },
        member: { connect: { id: member.id } },
        case: { connect: { id: biCase.id } },
        category: 'رسوم خبير تثمين',
        description: 'استعانة بخبير تثمين عقاري معتمد',
        amount: 2000.0,
        status: 'BILLED',
      },
    });
  });

  // -------------------------------------------------------------
  // SCENARIO 1: Executive KPI & Revenue Analytics Dashboard
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Testing Executive BI KPI & Revenue Analytics Dashboard...');
  const kpis = await executiveService.getExecutiveKpis(tenantA);
  console.log(`- Total Revenue Generated SAR: ${kpis.totalRevenueSar} SAR`);
  console.log(`- Active Cases Count:          ${kpis.activeCasesCount}`);
  console.log(`- Total Invoices Issued:       ${kpis.totalInvoicesIssued}`);
  console.log(`- Collection Rate Percent:     ${kpis.totalCollectionRatePercent}%`);

  if (kpis.totalRevenueSar < 11500 || kpis.activeCasesCount < 1) {
    throw new Error('Executive Analytics KPI calculation failed!');
  }
  console.log('✔ Executive BI KPI & Revenue Analytics Verified!');

  // -------------------------------------------------------------
  // SCENARIO 2: Fee Earner / Lawyer Utilization Performance Metrics
  // -------------------------------------------------------------
  console.log('\n[Scenario 2] Testing Fee Earner / Lawyer Utilization Metrics...');
  const performance = await lawyerService.getLawyerPerformance(tenantA);
  console.log(`- Fee Earners Evaluated Count: ${performance.length}`);
  console.log(`- Lawyer Name:                 "${performance[0]?.lawyerName}"`);
  console.log(`- Total Logged Hours:          ${performance[0]?.totalLoggedHours} hrs`);
  console.log(`- Total Billable Amount SAR:    ${performance[0]?.totalBillableAmountSar} SAR`);
  console.log(`- Assigned Active Cases:       ${performance[0]?.activeAssignedCasesCount}`);

  if (performance.length < 1 || performance[0].totalLoggedHours < 12) {
    throw new Error('Lawyer Utilization Performance calculation failed!');
  }
  console.log('✔ Fee Earner / Lawyer Utilization Performance Verified!');

  // -------------------------------------------------------------
  // SCENARIO 3: ZATCA 15% VAT Tax Return Filing Calculations
  // -------------------------------------------------------------
  console.log('\n[Scenario 3] Testing ZATCA 15% VAT Tax Return Calculation...');
  const vatSummary = await zatcaService.generateZatcaVatReturn(tenantA, 'Q3 2026');
  console.log(`- Tax Period:                  "${vatSummary.periodQuarter}"`);
  console.log(`- Total Net Taxable Sales SAR: ${vatSummary.totalTaxableSalesSar} SAR`);
  console.log(`- 15% VAT Collected SAR:       ${vatSummary.vatCollectedSar} SAR`);
  console.log(`- Deductible Expense VAT SAR:  ${vatSummary.vatDeductibleOnExpensesSar} SAR`);
  console.log(`- Net ZATCA VAT Payable SAR:   ${vatSummary.netVatPayableSar} SAR`);

  if (vatSummary.vatCollectedSar < 1500) {
    throw new Error('ZATCA 15% VAT Return calculation failed!');
  }
  console.log('✔ ZATCA 15% VAT Tax Return Calculation Verified!');

  // -------------------------------------------------------------
  // SCENARIO 4: Report Exporter Stream (PDF & XLSX)
  // -------------------------------------------------------------
  console.log('\n[Scenario 4] Testing PDF & XLSX Report Exporter...');
  const pdfExport = await exportService.exportReport({
    reportType: 'ZATCA_VAT',
    format: 'PDF',
    data: vatSummary,
  });
  console.log(`- PDF Export ID:              "${pdfExport.exportId}"`);
  console.log(`- Download Link URL:          "${pdfExport.downloadUrl}"`);
  console.log(`- File Size:                  ${pdfExport.fileSizeBytes} bytes`);

  const xlsxExport = await exportService.exportReport({
    reportType: 'EXECUTIVE_KPI',
    format: 'XLSX',
    data: kpis,
  });
  console.log(`- XLSX Export ID:             "${xlsxExport.exportId}"`);
  console.log(`- Download Link URL:          "${xlsxExport.downloadUrl}"`);

  if (pdfExport.format !== 'PDF' || xlsxExport.format !== 'XLSX') {
    throw new Error('PDF/XLSX Report Exporter failed!');
  }
  console.log('✔ PDF & XLSX Report Exporter Stream Verified!');

  // -------------------------------------------------------------
  // SCENARIO 5: Enterprise BI Multi-Tenant Security RLS Isolation
  // -------------------------------------------------------------
  console.log('\n[Scenario 5] Verifying Enterprise BI Multi-Tenant Security RLS Isolation...');

  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBKpis = await executiveService.getExecutiveKpis(tenantB);
    console.log(`- Tenant B Total Revenue SAR: ${tenantBKpis.totalRevenueSar} SAR`);
    console.log(`- Tenant B Active Cases Count: ${tenantBKpis.activeCasesCount}`);

    const tenantBVat = await zatcaService.generateZatcaVatReturn(tenantB, 'Q3 2026');
    console.log(`- Tenant B VAT Collected SAR: ${tenantBVat.vatCollectedSar} SAR`);

    if (tenantBKpis.totalRevenueSar !== 0 || tenantBVat.vatCollectedSar !== 0) {
      throw new Error('RLS FAILURE: Tenant B queried Tenant A Enterprise BI analytics data!');
    }
  });
  console.log('✔ Multi-Tenant Enterprise BI Security RLS Isolation Verified!');

  console.log('\n✅ ALL ENTERPRISE BI & REPORTING DOMAIN (PHASE 22) SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ ENTERPRISE BI VERIFICATION FAILED:', err);
  process.exit(1);
});
