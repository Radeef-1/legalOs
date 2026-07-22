import { BaseEvent } from '../base/base-event';

export interface IEventPublisher {
  publish(event: BaseEvent, tx?: any): Promise<void>;
  publishMany(events: BaseEvent[], tx?: any): Promise<void>;
  publishAsync(event: BaseEvent, tx?: any): Promise<void>;
  schedule(event: BaseEvent, delayMs: number, tx?: any): Promise<void>;
}
