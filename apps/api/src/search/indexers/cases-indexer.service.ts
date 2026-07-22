import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { ArabicNormalizer } from '../normalizer/arabic-normalizer';
import { SearchResultItem } from './search-result.interface';

@Injectable()
export class CasesIndexerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: ArabicNormalizer,
  ) {}

  async searchCases(query: string, limit = 10): Promise<SearchResultItem[]> {
    const normalizedQuery = this.normalizer.normalize(query);
    if (!normalizedQuery) return [];

    const cases = await this.prisma.db.case.findMany({
      where: {
        OR: [
          { caseNumberInternal: { contains: normalizedQuery, mode: 'insensitive' } },
          { najizCaseNumber: { contains: normalizedQuery, mode: 'insensitive' } },
          { courtName: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { openedAt: 'desc' },
    });

    return cases.map((c) => ({
      id: c.id,
      entityType: 'cases',
      title: `قضية رقم: ${c.caseNumberInternal}`,
      subtitle: `ناجز: ${c.najizCaseNumber || 'N/A'} | ${c.courtName || 'المحكمة'}`,
      url: `/cases/${c.id}`,
      score: c.caseNumberInternal.includes(normalizedQuery) ? 1.0 : 0.8,
      highlightSnippet: this.normalizer.highlightSnippet(`قضية ${c.caseNumberInternal} - ${c.courtName || ''}`, query),
      createdAt: c.openedAt,
      metadata: {
        status: c.status,
        caseType: c.caseType,
      },
    }));
  }
}
