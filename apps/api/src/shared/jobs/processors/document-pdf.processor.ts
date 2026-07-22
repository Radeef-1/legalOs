import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../contracts/job-processor.interface';
import { JobRecord, JobType } from '../contracts/job-data.interface';
import { QueueService } from '../queue/queue.service';

export interface DocumentPdfJobData {
  organizationId: string;
  documentId: string;
  documentTitle: string;
  templateType: 'INVOICE_PDF' | 'COURT_BRIEF_PDF';
}

@Injectable()
export class DocumentPdfProcessor implements IJobProcessor<DocumentPdfJobData>, OnModuleInit {
  readonly jobType = JobType.DOCUMENT_PDF_COMPILATION;
  private readonly logger = new Logger(DocumentPdfProcessor.name);

  constructor(private readonly queueService: QueueService) {}

  onModuleInit() {
    this.queueService.registerProcessor(this);
  }

  async process(job: JobRecord<DocumentPdfJobData>, updateProgress: (progress: number) => void): Promise<any> {
    this.logger.log(`[DocumentPdfProcessor] Compiling PDF for Document [ID: ${job.payload.documentId}, Title: "${job.payload.documentTitle}"]`);

    updateProgress(30);
    // Simulate HTML to PDF compilation engine (Puppeteer / PDFKit)
    await new Promise((resolve) => setTimeout(resolve, 50));

    updateProgress(75);
    // Store in S3 storage bucket
    await new Promise((resolve) => setTimeout(resolve, 50));

    updateProgress(100);
    return {
      pdfUrl: `https://storage.legalos.sa/docs/${job.payload.documentId}.pdf`,
      sizeBytes: 458920,
      compiledAt: new Date().toISOString(),
    };
  }
}
