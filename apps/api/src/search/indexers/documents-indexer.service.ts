import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { ArabicNormalizer } from '../normalizer/arabic-normalizer';
import { SearchResultItem } from './search-result.interface';

@Injectable()
export class DocumentsIndexerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: ArabicNormalizer,
  ) {}

  async searchDocuments(query: string, limit = 10): Promise<SearchResultItem[]> {
    const normalizedQuery = this.normalizer.normalize(query);
    if (!normalizedQuery) return [];

    const docs = await this.prisma.db.document.findMany({
      where: {
        OR: [
          { storagePath: { contains: normalizedQuery, mode: 'insensitive' } },
          { fileType: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });

    return docs.map((d) => ({
      id: d.id,
      entityType: 'documents',
      title: d.storagePath.split('/').pop() || d.storagePath,
      subtitle: `مسار الملف: ${d.storagePath} | نوع الملف: ${d.fileType}`,
      url: `/documents/${d.id}`,
      score: 0.9,
      highlightSnippet: this.normalizer.highlightSnippet(d.storagePath, query),
      metadata: {
        fileType: d.fileType,
        caseId: d.caseId,
      },
    }));
  }
}
