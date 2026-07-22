import { BaseEvent, EventMetadata } from '../../../shared/events/base/base-event';

export class CaseCreatedEvent extends BaseEvent {
  readonly caseId: string;
  readonly caseNumberInternal: string;
  readonly clientId: string;

  constructor(params: {
    caseId: string;
    caseNumberInternal: string;
    clientId: string;
    metadata: EventMetadata;
    correlationId?: string;
    causationId?: string;
  }) {
    super({
      eventName: 'case.created',
      aggregateType: 'Case',
      aggregateId: params.caseId,
      metadata: params.metadata,
      correlationId: params.correlationId,
      causationId: params.causationId,
      version: 1,
    });
    this.caseId = params.caseId;
    this.caseNumberInternal = params.caseNumberInternal;
    this.clientId = params.clientId;
  }
}
