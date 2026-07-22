export enum JobType {
  NAJIZ_SYNC = 'NAJIZ_SYNC',
  DOCUMENT_PDF_COMPILATION = 'DOCUMENT_PDF_COMPILATION',
  HEARING_REMINDER = 'HEARING_REMINDER',
  BATCH_NOTIFICATION = 'BATCH_NOTIFICATION',
}

export enum JobStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DEAD_LETTER = 'DEAD_LETTER',
}

export interface BaseJobPayload {
  organizationId: string;
  userId?: string;
  correlationId?: string;
}

export interface JobRecord<T = any> {
  id: string;
  queueName: string;
  type: JobType;
  payload: T;
  status: JobStatus;
  progress: number; // 0 to 100
  attempts: number;
  maxAttempts: number;
  delayMs?: number;
  scheduledAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: any;
}

export interface QueueMetrics {
  queueName: string;
  totalJobs: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  deadLetter: number;
}
