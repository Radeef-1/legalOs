import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { ArabicNormalizer } from '../normalizer/arabic-normalizer';
import { SearchResultItem } from './search-result.interface';

@Injectable()
export class ClientsIndexerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: ArabicNormalizer,
  ) {}

  async searchClients(query: string, limit = 10): Promise<SearchResultItem[]> {
    const normalizedQuery = this.normalizer.normalize(query);
    if (!normalizedQuery) return [];

    const clients = await this.prisma.db.client.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { nationalIdOrCr: { contains: normalizedQuery, mode: 'insensitive' } },
          { phone: { contains: normalizedQuery, mode: 'insensitive' } },
          { email: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });

    return clients.map((c) => ({
      id: c.id,
      entityType: 'clients',
      title: c.name,
      subtitle: `هوية/سجل: ${c.nationalIdOrCr || 'N/A'} | هاتف: ${c.phone || 'N/A'}`,
      url: `/clients/${c.id}`,
      score: c.name.includes(normalizedQuery) ? 1.0 : 0.7,
      highlightSnippet: this.normalizer.highlightSnippet(`${c.name} - ${c.nationalIdOrCr || ''}`, query),
      metadata: {
        phone: c.phone,
        email: c.email,
      },
    }));
  }
}
