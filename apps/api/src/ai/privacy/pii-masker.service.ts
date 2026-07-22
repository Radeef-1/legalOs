import { Injectable } from '@nestjs/common';

export interface MaskResult {
  maskedText: string;
  piiMap: Record<string, string>;
}

@Injectable()
export class PiiMaskerService {
  /**
   * Masks Personally Identifiable Information (PII) before sending text to external LLMs.
   */
  mask(text: string): MaskResult {
    if (!text) return { maskedText: '', piiMap: {} };

    const piiMap: Record<string, string> = {};
    let maskedText = text;

    let idCounter = 1;
    let phoneCounter = 1;
    let emailCounter = 1;
    let ibanCounter = 1;

    // 1. Mask Saudi IBANs (SA + 22 digits)
    maskedText = maskedText.replace(/SA\d{22}/gi, (match) => {
      const token = `[IBAN_${ibanCounter++}]`;
      piiMap[token] = match;
      return token;
    });

    // 2. Mask Saudi National IDs / Iqamas (10 digits starting with 1 or 2)
    maskedText = maskedText.replace(/\b[12]\d{9}\b/g, (match) => {
      const token = `[NATIONAL_ID_${idCounter++}]`;
      piiMap[token] = match;
      return token;
    });

    // 3. Mask Saudi Phone Numbers (+9665XXXXXXXX or 05XXXXXXXX)
    maskedText = maskedText.replace(/(?:\+9665|05)\d{8}\b/g, (match) => {
      const token = `[PHONE_${phoneCounter++}]`;
      piiMap[token] = match;
      return token;
    });

    // 4. Mask Emails
    maskedText = maskedText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
      const token = `[EMAIL_${emailCounter++}]`;
      piiMap[token] = match;
      return token;
    });

    return { maskedText, piiMap };
  }

  /**
   * Restores original PII values back into the generated LLM text response.
   */
  unmask(maskedText: string, piiMap: Record<string, string>): string {
    if (!maskedText || !piiMap) return maskedText || '';

    let unmaskedText = maskedText;
    for (const [token, originalValue] of Object.entries(piiMap)) {
      unmaskedText = unmaskedText.split(token).join(originalValue);
    }

    return unmaskedText;
  }
}
