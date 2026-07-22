import { Injectable } from '@nestjs/common';

@Injectable()
export class ArabicNormalizer {
  /**
   * Normalizes Arabic text by removing diacritics, unifying Alef, Teh Marbuta, Alef Maksura, and Tatweel.
   */
  normalize(text: string | null | undefined): string {
    if (!text) return '';

    return text
      // Remove Arabic Diacritics (Harakat)
      .replace(/[\u064B-\u0652\u0670]/g, '')
      // Remove Tatweel (Kashida)
      .replace(/\u0640/g, '')
      // Normalize Alef forms (أ, إ, آ -> ا)
      .replace(/[أإآ]/g, 'ا')
      // Normalize Teh Marbuta (ة -> ه)
      .replace(/ة/g, 'ه')
      // Normalize Alef Maksura (ى -> ي)
      .replace(/ى/g, 'ي')
      // Clean extra whitespaces
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Generates search highlight snippet by surrounding match query terms with <mark> tags.
   */
  highlightSnippet(content: string, rawQuery: string, maxLen = 150): string {
    if (!content || !rawQuery) return content || '';

    const normalizedQuery = this.normalize(rawQuery).toLowerCase();
    const queryTerms = normalizedQuery.split(' ').filter((t) => t.length > 1);

    let snippet = content;
    if (snippet.length > maxLen) {
      const firstIndex = snippet.toLowerCase().indexOf(queryTerms[0] || '');
      const start = Math.max(0, firstIndex - 30);
      snippet = (start > 0 ? '...' : '') + snippet.substring(start, start + maxLen) + '...';
    }

    for (const term of queryTerms) {
      const regex = new RegExp(`(${term})`, 'gi');
      snippet = snippet.replace(regex, '<mark>$1</mark>');
    }

    return snippet;
  }
}
