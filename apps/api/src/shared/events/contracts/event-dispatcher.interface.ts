import { BaseEvent } from '../base/base-event';

export interface IEventDispatcher {
  dispatch(event: BaseEvent): Promise<void>;
}
