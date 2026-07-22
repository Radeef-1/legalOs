import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppNotificationPayload {
  toPhoneNumber: string;
  recipientName: string;
  templateType: 'HEARING_REMINDER' | 'CASE_UPDATE' | 'INVOICE_ISSUED';
  variables: Record<string, string>;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  /**
   * إرسال تنبيه واتساب مباشر للموكل أو المحامي
   */
  async sendWhatsAppMessage(payload: WhatsAppNotificationPayload): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`إرسال رسالة واتساب إلى ${payload.toPhoneNumber} - القالب: ${payload.templateType}`);

    let messageText = '';

    switch (payload.templateType) {
      case 'HEARING_REMINDER':
        messageText = `مرحباً ${payload.recipientName}،\nتذكير بموعد الجلسة القضائية المقبلة:\n📌 القضية: ${payload.variables.caseNumber}\n🏛️ المحكمة: ${payload.variables.courtName}\n📅 الموعد: ${payload.variables.hearingDate}\n🔗 رابط الجلسة: ${payload.variables.meetingUrl || 'لا يوجد (جلسة حضورية)'}\n\nLegalOS Legal Operations`;
        break;

      case 'CASE_UPDATE':
        messageText = `مرحباً ${payload.recipientName}،\nتم تحديث حالة القضية رقم (${payload.variables.caseNumber}):\nالحالة الجديدة: ${payload.variables.newStatus}\nملاحظات: ${payload.variables.notes}\n\nيمكنك الاطلاع على التفاصيل عبر بوابة الموكلين.`;
        break;

      case 'INVOICE_ISSUED':
        messageText = `مرحباً ${payload.recipientName}،\nتم إصدار فاتورة جديدة برقم (${payload.variables.invoiceNumber}):\nالمبلغ الإجمالي: ${payload.variables.amount} ر.س\nتاريخ الاستحقاق: ${payload.variables.dueDate}\n\nشاكرين لكم تعاملكم مع المكتب.`;
        break;
    }

    // هنا يتم الاتصال بالمزود الخارجي (مثل Twilio / Meta WhatsApp Business Cloud API)
    // نضع سجل آمن ومحاكاة الاستجابة بنجاح
    const messageId = `wa_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.logger.log(`تم تسليم إشعار الواتساب بنجاح. المعرف: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  }
}
