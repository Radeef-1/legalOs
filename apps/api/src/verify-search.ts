import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ArabicNormalizer } from './search/normalizer/arabic-normalizer';
import { GlobalSearchService } from './search/service/global-search.service';
import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';

async function bootstrap() {
  console.log('--- STARTING SEARCH & INDEXING ENGINE DOMAIN VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const prisma = app.get(PrismaService);
  const normalizer = app.get(ArabicNormalizer);
  const globalSearchService = app.get(GlobalSearchService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  // -------------------------------------------------------------
  // SCENARIO 1: Arabic Text Normalizer & Snippet Highlighter
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Testing Arabic Morphological Normalizer & Snippet Highlighter...');
  const inputString = 'شَرِكَةُ أَبُوهَا لِلْمُحَامَاةِ وَالإِسْتِشَارَاتِ';
  const normalized = normalizer.normalize(inputString);
  console.log(`- Input:      "${inputString}"`);
  console.log(`- Normalized: "${normalized}"`);

  if (normalized !== 'شركه ابوها للمحاماه والاستشارات') {
    throw new Error(`Arabic Normalization mismatch! Received: "${normalized}"`);
  }

  const snippet = normalizer.highlightSnippet('تم توقيع عقد توريد تجاري بين الطرفين', 'تجاري');
  console.log(`- Highlight Snippet: "${snippet}"`);
  if (!snippet.includes('<mark>تجاري</mark>')) {
    throw new Error('Snippet highlighting failed!');
  }
  console.log('✔ Arabic Morphological Normalizer Verified!');

  // Seed test data under Tenant A
  await TenantContext.run({ tenantId: tenantA }, async () => {
    // -------------------------------------------------------------
    // SCENARIO 2: Multi-Entity Global Full-Text Search
    // -------------------------------------------------------------
    console.log('\n[Scenario 2] Executing Multi-Entity Global Full-Text Search...');
    
    let testClient = await prisma.db.client.findFirst({ where: { nationalIdOrCr: '1092837465' } });
    if (!testClient) {
      testClient = await prisma.db.client.create({
        data: {
          organizationId: tenantA,
          name: 'شركة التقنية التجارية المحدودة',
          nationalIdOrCr: '1092837465',
          phone: '+966501234567',
        },
      });
    }

    let testCase = await prisma.db.case.findFirst({ where: { caseNumberInternal: 'SRCH-2026-01' } });
    if (!testCase) {
      testCase = await prisma.db.case.create({
        data: {
          organizationId: tenantA,
          clientId: testClient.id,
          caseNumberInternal: 'SRCH-2026-01',
          najizCaseNumber: '40921447-تجاري',
          courtName: 'المحكمة التجارية بالرياض',
          caseType: 'commercial',
        },
      });
    }

    const searchRes = await globalSearchService.globalSearch({ query: 'تجاري' });
    console.log(`- Search Query: "تجاري" -> Total Matches Found: ${searchRes.totalMatches}`);
    console.log(`- Facets Summary:`, JSON.stringify(searchRes.facets, null, 2));

    if (searchRes.totalMatches < 2) {
      throw new Error('Expected at least 2 matching entities for search query "تجاري"!');
    }
    console.log('✔ Multi-Entity Global Full-Text Search Verified!');

    // -------------------------------------------------------------
    // SCENARIO 3: Faceted Entity Type Filtering
    // -------------------------------------------------------------
    console.log('\n[Scenario 3] Testing Faceted Entity Type Filtering (types=["cases"])...');
    const casesOnlyRes = await globalSearchService.globalSearch({
      query: 'تجاري',
      types: ['cases'],
    });

    console.log(`- Cases-Only Search Matches: ${casesOnlyRes.results.length}`);
    const nonCaseItem = casesOnlyRes.results.find((r) => r.entityType !== 'cases');
    if (nonCaseItem) {
      throw new Error('Faceted filtering failure: Non-case item returned when types=["cases"]!');
    }
    console.log('✔ Faceted Entity Type Filtering Verified!');

    // -------------------------------------------------------------
    // SCENARIO 4: Autocomplete Suggestions API
    // -------------------------------------------------------------
    console.log('\n[Scenario 4] Testing Autocomplete Suggestions API...');
    const suggestions = await globalSearchService.getSuggestions('تجاري', 5);
    console.log(`- Suggestions count: ${suggestions.length}`);
    console.log(`- Top Suggestion: "${suggestions[0]?.title}" (${suggestions[0]?.type})`);
    if (suggestions.length === 0) {
      throw new Error('Expected non-empty suggestions array!');
    }
    console.log('✔ Autocomplete Suggestions Engine Verified!');
  });

  // -------------------------------------------------------------
  // SCENARIO 5: Multi-Tenant RLS Security Isolation
  // -------------------------------------------------------------
  console.log('\n[Scenario 5] Verifying Multi-Tenant Search RLS Security Isolation...');
  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBRes = await globalSearchService.globalSearch({ query: 'تجاري' });
    console.log(`- Tenant B search returned: ${tenantBRes.totalMatches} items`);
    if (tenantBRes.totalMatches !== 0) {
      throw new Error('RLS FAILURE: Tenant B search returned Tenant A entities!');
    }
    console.log('✔ PostgreSQL Search RLS Security Isolation Verified!');
  });

  console.log('\n✅ ALL SEARCH & INDEXING ENGINE DOMAIN SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ SEARCH ENGINE VERIFICATION FAILED:', err);
  process.exit(1);
});
