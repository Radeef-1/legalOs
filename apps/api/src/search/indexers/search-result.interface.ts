export type SearchEntityType = 'cases' | 'clients' | 'documents' | 'hearings' | 'invoices';

export interface SearchResultItem {
  id: string;
  entityType: SearchEntityType;
  title: string;
  subtitle: string;
  url: string;
  score: number;
  highlightSnippet: string;
  createdAt?: Date;
  metadata?: Record<string, any>;
}
