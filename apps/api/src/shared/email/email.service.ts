import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    console.log(`[Email Service] Sending email to: ${to}`);
    console.log(`[Email Service] Subject: ${subject}`);
    console.log(`[Email Service] Content: ${htmlContent.substring(0, 100)}...`);

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: 'LegalOS <noreply@legalos.sa>',
            to: [to],
            subject,
            html: htmlContent,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[Email Service] Resend API error: ${errText}`);
          return false;
        }

        console.log(`[Email Service] Resend API dispatched successfully.`);
        return true;
      } catch (err) {
        console.error(`[Email Service] Resend API failed:`, err);
        return false;
      }
    }

    // Default local success path (logging to stdout)
    return true;
  }
}
