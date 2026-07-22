import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { BaseEvent } from '../base/base-event';
import { IEventDispatcher } from '../contracts/event-dispatcher.interface';
import { IEventHandler } from '../contracts/event-handler.interface';
import { EVENT_HANDLER_METADATA } from '../decorators/event-handler.decorator';

@Injectable()
export class EventEmitterDispatcher implements IEventDispatcher, OnApplicationBootstrap {
  private readonly handlers = new Map<string, IEventHandler[]>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  onApplicationBootstrap() {
    const providers = this.discoveryService.getProviders();
    
    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      const eventName = this.reflector.get<string>(EVENT_HANDLER_METADATA, metatype);
      if (eventName) {
        if (typeof (instance as any).handle === 'function') {
          const list = this.handlers.get(eventName) || [];
          list.push(instance as IEventHandler);
          this.handlers.set(eventName, list);
        }
      }
    }
  }

  async dispatch(event: BaseEvent): Promise<void> {
    const list = this.handlers.get(event.eventName) || [];
    if (list.length === 0) return;

    const errors: any[] = [];
    
    // Await all handlers and ensure they execute isolated from each other
    await Promise.all(
      list.map(async (handler) => {
        try {
          await handler.handle(event);
        } catch (err: any) {
          errors.push(err);
          console.error(`[EventHandler Error] Handler failed for event: ${event.eventName}.`, err);
        }
      })
    );

    if (errors.length > 0) {
      throw new Error(`One or more event handlers failed: ${errors.map((e) => e.message || String(e)).join(', ')}`);
    }
  }
}
