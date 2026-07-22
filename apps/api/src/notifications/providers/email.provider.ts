import { Injectable, Logger } from '@nestjs/common';

export interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: 'HEARING_REMINDER' | 'INVOICE_ISSUED' | 'WORKFLOW_APPROVAL' | 'GENERAL_ALERT';
  data: Record<string, any>;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  async sendEmail(options: SendEmailOptions): Promise<{ messageId: string; status: 'SENT' | 'FAILED'; html: string }> {
    const html = this.renderHtmlTemplate(options.templateName, options.data);
    this.logger.log(`[EmailProvider] Sending ${options.templateName} email to ${options.to} (Subject: "${options.subject}")`);

    // Mock SMTP / SendGrid / AWS SES delivery
    const messageId = `msg-email-${Date.now()}`;
    return {
      messageId,
      status: 'SENT',
      html,
    };
  }

  private renderHtmlTemplate(templateName: string, data: Record<string, any>): string {
    switch (templateName) {
      case 'HEARING_REMINDER':
        return `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a;">⚖️ تذكير بموعد جلسة قضائية - LegalOS</h2>
            <p>سعادة المحامي/الموكل <strong>${data.recipientName ?? 'المحترم'}</strong>،</p>
            <p>نحيطكم علماً بموعد الجلسة القضائية القادمة وفق البيانات التالية:</p>
            <ul>
              <li><strong>رقم القضية:</strong> ${data.caseNumber ?? 'N/A'}</li>
              <li><strong>اسم المحكمة:</strong> ${data.courtName ?? 'المحكمة التجارية'}</li>
              <li><strong>تاريخ ووقت الجلسة:</strong> ${data.hearingDate ?? 'N/A'}</li>
            </ul>
            <p style="color: #475569;">يرجى الحضور في الموعد المحدد واصطحاب المستندات اللازمة.</p>
          </div>
        `;

      case 'INVOICE_ISSUED':
        return `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #047857;">🧾 فاتورة ضريبية جديدة - ${data.invoiceNumber}</h2>
            <p>عزيزي العميل <strong>${data.clientName}</strong>،</p>
            <p>تم إصدار فاتورة خدمات قانونية جديدة بمبلغ إجمالي قدره <strong>${data.totalAmount} ر.س</strong> شامل ضريبة القيمة المضافة (15%).</p>
            <p>رصيد الفاتورة المستحق: <strong>${data.balanceDue} ر.س</strong></p>
          </div>
        `;

      default:
        return `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">
            <h3>تنبيه من منصة LegalOS</h3>
            <p>${data.message ?? 'لا توجد تفاصيل إضافية'}</p>
          </div>
        `;
    }
  }
}
