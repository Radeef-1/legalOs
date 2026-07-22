import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { ArabicNormalizer } from '../normalizer/arabic-normalizer';
import { SearchResultItem } from './search-result.interface';

@Injectable()
export class InvoicesIndexerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: ArabicNormalizer,
  ) {}

  async searchInvoices(query: string, limit = 10): Promise<SearchResultItem[]> {
    const normalizedQuery = this.normalizer.normalize(query);
    if (!normalizedQuery) return [];

    const invoices = await this.prisma.db.invoice.findMany({
      where: {
        OR: [
          { invoiceNumber: { contains: normalizedQuery, mode: 'insensitive' } },
          { notes: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((inv) => ({
      id: inv.id,
      entityType: 'invoices',
      title: `فاتورة رقم: ${inv.invoiceNumber}`,
      subtitle: `المبلغ الإجمالي: ${inv.totalAmount} ر.س | المتبقي: ${inv.balanceDue} ر.س`,
      url: `/finance/invoices/${inv.id}`,
      score: inv.invoiceNumber.includes(normalizedQuery) ? 1.0 : 0.75,
      highlightSnippet: this.normalizer.highlightSnippet(`فاتورة ${inv.invoiceNumber} - ${inv.notes || ''}`, query),
      createdAt: inv.createdAt,
      metadata: {
        status: inv.status,
        totalAmount: inv.totalAmount,
      },
    }));
  }
}
