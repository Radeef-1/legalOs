import { BaseEvent } from '../base/base-event';

export interface IEventHandler<T extends BaseEvent = BaseEvent> {
  handle(event: T): Promise<void>;
}
