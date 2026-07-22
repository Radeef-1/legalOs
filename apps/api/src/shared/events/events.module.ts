import { Module, Global } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventEmitterDispatcher } from './dispatcher/event-emitter.dispatcher';
import { PrismaOutboxRepository } from './outbox/prisma-outbox.repository';
import { OutboxEventPublisher } from './publisher/outbox-event-publisher';
import { OutboxWorker } from './outbox/outbox.worker';
import { AuditEventHandler } from './handlers/audit-event.handler';
import { EVENT_DISPATCHER_TOKEN, OUTBOX_REPOSITORY_TOKEN, EVENT_PUBLISHER_TOKEN } from './tokens';

export { EVENT_DISPATCHER_TOKEN, OUTBOX_REPOSITORY_TOKEN, EVENT_PUBLISHER_TOKEN };

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    {
      provide: EVENT_DISPATCHER_TOKEN,
      useClass: EventEmitterDispatcher,
    },
    {
      provide: OUTBOX_REPOSITORY_TOKEN,
      useClass: PrismaOutboxRepository,
    },
    {
      provide: EVENT_PUBLISHER_TOKEN,
      useClass: OutboxEventPublisher,
    },
    OutboxWorker,
    AuditEventHandler,
  ],
  exports: [
    EVENT_DISPATCHER_TOKEN,
    OUTBOX_REPOSITORY_TOKEN,
    EVENT_PUBLISHER_TOKEN,
  ],
})
export class EventsModule {}
