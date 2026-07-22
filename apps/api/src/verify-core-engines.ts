import { NajizOutboxEngine } from './integrations/core/najiz-outbox.engine';
import { SaudiLegalRagEngine } from './ai/engine/saudi-legal-rag.engine';
import { DocumentProcessorEngine } from './documents/engine/document-processor.engine';

async function main() {
  console.log('========================================================================');
  console.log('🚀 TESTING LEGALOS CORE ENGINES PACK (NAJIZ OUTBOX, SAUDI RAG, OCR VAULT)');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------
  // 1. TEST ENGINE 1: NAJIZ OUTBOX ENGINE
  // -------------------------------------------------------------------
  console.log('[ENGINE 1] Testing Najiz Transactional Outbox Engine...');
  const prismaMock: any = {};
  const outboxEngine = new NajizOutboxEngine(prismaMock);

  const event1 = await outboxEngine.enqueueEvent({
    eventId: 'evt-najiz-101',
    eventType: 'NAJIZ_HEARING_SCHEDULED',
    tenantId: 'firm-tenant-salman-01',
    najizCaseNumber: '449012847',
    payload: { hearingDate: '2026-08-10', courtRoom: 'قاعة 4' },
  });

  const event2 = await outboxEngine.enqueueEvent({
    eventId: 'evt-najiz-102',
    eventType: 'NAJIZ_CASE_STATUS_CHANGED',
    tenantId: 'firm-tenant-salman-01',
    najizCaseNumber: '449012847',
    payload: { status: 'حكم ابتدائي', simulateFailure: true },
    maxAttempts: 3,
  });

  console.log(`- Enqueued Event 1 ID: ${event1.id} (Status: ${event1.status})`);
  console.log(`- Enqueued Event 2 ID: ${event2.id} (Status: ${event2.status})`);

  const metrics = outboxEngine.getQueueMetrics();
  console.log(`- Outbox Metrics: Total=${metrics.totalInQueue}, Completed=${metrics.completed}, Pending=${metrics.pending}`);

  if (metrics.totalInQueue !== 2 || metrics.completed !== 1) {
    throw new Error('Najiz Outbox Engine verification failed!');
  }
  console.log('✔ Engine 1 (Najiz Outbox) PASSED 100%!\n');

  // -------------------------------------------------------------------
  // 2. TEST ENGINE 2: SAUDI LEGAL RAG ENGINE
  // -------------------------------------------------------------------
  console.log('[ENGINE 2] Testing Saudi Legal RAG & PII Anonymization Engine...');
  const ragEngine = new SaudiLegalRagEngine();

  const piiTest = ragEngine.anonymizeInputText('المواطن هوية رقم 1098452104 وسجل تجاري 1010984521 وهاتف 0500000000');
  console.log(`- PII Anonymization Result: "${piiTest.cleanText}" (Masked Items: ${piiTest.maskedCount})`);

  if (piiTest.maskedCount !== 3) {
    throw new Error('PII Anonymization Filter failed!');
  }

  const analysis = await ragEngine.generateLegalAnalysis('مطالبة بمستحقات توريد وعقد تجاري وتأخير تسليم البضاعة');
  console.log(`- RAG Matched Articles Count: ${analysis.retrievedArticles.length}`);
  console.log(`- First Matched Article: "${analysis.retrievedArticles[0]?.title}" (${analysis.retrievedArticles[0]?.sourceLaw})`);

  if (analysis.retrievedArticles.length === 0) {
    throw new Error('Saudi Legal RAG Retrieval failed!');
  }
  console.log('✔ Engine 2 (Saudi Legal RAG) PASSED 100%!\n');

  // -------------------------------------------------------------------
  // 3. TEST ENGINE 3: DOCUMENT PROCESSOR & OCR VAULT ENGINE
  // -------------------------------------------------------------------
  console.log('[ENGINE 3] Testing Document Processor, OCR & Cryptographic Seal Engine...');
  const docEngine = new DocumentProcessorEngine();

  const sampleDocText = `صادر من المحكمة التجارية بالرياض بتاريخ 1447/08/10هـ في القضية رقم 449012847 ومبلغ المطالبة 1,450,000 ر.س بموجب عقد السداد الإيجاري.`;
  const processedDoc = await docEngine.processOcrAndExtractMetadata('doc-101', 'صك_حكم_تجاري.pdf', sampleDocText);

  console.log(`- Extracted Court: "${processedDoc.metadata.extractedCourtName}"`);
  console.log(`- Extracted Hijri Date: "${processedDoc.metadata.extractedHijriDate}"`);
  console.log(`- Extracted Judgment #: "${processedDoc.metadata.extractedJudgmentNumber}"`);
  console.log(`- Digital Seal Stamp: "${processedDoc.digitalSignature}"`);

  if (!processedDoc.digitalSignature.startsWith('LEGALOS-SEAL-SHA256')) {
    throw new Error('Document Seal Generation failed!');
  }
  console.log('✔ Engine 3 (Document Processor & Digital Seal) PASSED 100%!\n');

  console.log('========================================================================');
  console.log('🎉 ALL 3 CORE ENGINES PASSED VERIFICATION 100%!');
  console.log('========================================================================');
}

main().catch((err) => {
  console.error('Core Engines Verification Failed:', err);
  process.exit(1);
});
