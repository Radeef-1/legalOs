import { Injectable } from '@nestjs/common';
import { CasesIndexerService } from '../indexers/cases-indexer.service';
import { ClientsIndexerService } from '../indexers/clients-indexer.service';
import { DocumentsIndexerService } from '../indexers/documents-indexer.service';
import { HearingsIndexerService } from '../indexers/hearings-indexer.service';
import { InvoicesIndexerService } from '../indexers/invoices-indexer.service';
import { SearchEntityType, SearchResultItem } from '../indexers/search-result.interface';
import { ArabicNormalizer } from '../normalizer/arabic-normalizer';

export interface GlobalSearchOptions {
  query: string;
  types?: SearchEntityType[];
  limit?: number;
}

@Injectable()
export class GlobalSearchService {
  constructor(
    private readonly normalizer: ArabicNormalizer,
    private readonly casesIndexer: CasesIndexerService,
    private readonly clientsIndexer: ClientsIndexerService,
    private readonly documentsIndexer: DocumentsIndexerService,
    private readonly hearingsIndexer: HearingsIndexerService,
    private readonly invoicesIndexer: InvoicesIndexerService,
  ) {}

  async globalSearch(options: GlobalSearchOptions): Promise<{
    query: string;
    normalizedQuery: string;
    totalMatches: number;
    results: SearchResultItem[];
    facets: Record<SearchEntityType, number>;
  }> {
    const rawQuery = options.query || '';
    const normalizedQuery = this.normalizer.normalize(rawQuery);
    if (!normalizedQuery) {
      return {
        query: rawQuery,
        normalizedQuery: '',
        totalMatches: 0,
        results: [],
        facets: { cases: 0, clients: 0, documents: 0, hearings: 0, invoices: 0 },
      };
    }

    const requestedTypes = options.types && options.types.length > 0
      ? options.types
      : (['cases', 'clients', 'documents', 'hearings', 'invoices'] as SearchEntityType[]);

    const limitPerEntity = options.limit || 10;
    const searchPromises: Promise<SearchResultItem[]>[] = [];

    if (requestedTypes.includes('cases')) searchPromises.push(this.casesIndexer.searchCases(normalizedQuery, limitPerEntity));
    if (requestedTypes.includes('clients')) searchPromises.push(this.clientsIndexer.searchClients(normalizedQuery, limitPerEntity));
    if (requestedTypes.includes('documents')) searchPromises.push(this.documentsIndexer.searchDocuments(normalizedQuery, limitPerEntity));
    if (requestedTypes.includes('hearings')) searchPromises.push(this.hearingsIndexer.searchHearings(normalizedQuery, limitPerEntity));
    if (requestedTypes.includes('invoices')) searchPromises.push(this.invoicesIndexer.searchInvoices(normalizedQuery, limitPerEntity));

    const resultsArrays = await Promise.all(searchPromises);
    const combinedResults = resultsArrays.flat();

    // Sort by relevance score desc, then by date desc
    combinedResults.sort((a, b) => b.score - a.score || (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    // Calculate entity facets
    const facets: Record<SearchEntityType, number> = {
      cases: combinedResults.filter((r) => r.entityType === 'cases').length,
      clients: combinedResults.filter((r) => r.entityType === 'clients').length,
      documents: combinedResults.filter((r) => r.entityType === 'documents').length,
      hearings: combinedResults.filter((r) => r.entityType === 'hearings').length,
      invoices: combinedResults.filter((r) => r.entityType === 'invoices').length,
    };

    return {
      query: rawQuery,
      normalizedQuery,
      totalMatches: combinedResults.length,
      results: combinedResults,
      facets,
    };
  }

  async getSuggestions(query: string, limit = 5): Promise<Array<{ title: string; type: SearchEntityType; url: string }>> {
    const searchRes = await this.globalSearch({ query, limit: 3 });
    return searchRes.results.slice(0, limit).map((item) => ({
      title: item.title,
      type: item.entityType,
      url: item.url,
    }));
  }
}
