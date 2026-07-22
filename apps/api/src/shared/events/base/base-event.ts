import * as crypto from 'crypto';

export interface EventMetadata {
  tenantId: string;
  userId: string;
  branchId?: string;
  requestId?: string;
  traceId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export abstract class BaseEvent {
  readonly id: string;
  readonly eventName: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly metadata: EventMetadata;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly version: number;

  constructor(params: {
    eventName: string;
    aggregateType: string;
    aggregateId: string;
    metadata: EventMetadata;
    correlationId?: string;
    causationId?: string;
    version?: number;
  }) {
    this.id = crypto.randomUUID();
    this.occurredAt = new Date();
    this.eventName = params.eventName;
    this.aggregateType = params.aggregateType;
    this.aggregateId = params.aggregateId;
    this.metadata = params.metadata;
    this.correlationId = params.correlationId;
    this.causationId = params.causationId;
    this.version = params.version || 1;
  }
}
