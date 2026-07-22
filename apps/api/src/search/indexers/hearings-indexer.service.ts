import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { ArabicNormalizer } from '../normalizer/arabic-normalizer';
import { SearchResultItem } from './search-result.interface';

@Injectable()
export class HearingsIndexerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: ArabicNormalizer,
  ) {}

  async searchHearings(query: string, limit = 10): Promise<SearchResultItem[]> {
    const normalizedQuery = this.normalizer.normalize(query);
    if (!normalizedQuery) return [];

    const hearings = await this.prisma.db.hearing.findMany({
      where: {
        OR: [
          { courtName: { contains: normalizedQuery, mode: 'insensitive' } },
          { judgeName: { contains: normalizedQuery, mode: 'insensitive' } },
          { notes: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { hearingDate: 'desc' },
    });

    return hearings.map((h) => ({
      id: h.id,
      entityType: 'hearings',
      title: `جلسة محكمة: ${h.courtName || 'المحكمة العامة'}`,
      subtitle: `تاريخ الجلسة: ${h.hearingDate.toISOString().split('T')[0]} | القاضي: ${h.judgeName || 'غير محدد'}`,
      url: `/calendar/hearings/${h.id}`,
      score: 0.85,
      highlightSnippet: this.normalizer.highlightSnippet(`${h.courtName || ''} - ${h.notes || ''}`, query),
      createdAt: h.createdAt,
      metadata: {
        status: h.status,
        hearingDate: h.hearingDate,
      },
    }));
  }
}
