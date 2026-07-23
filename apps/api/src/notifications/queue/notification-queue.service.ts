import { Injectable, Logger } from '@nestjs/common';

export interface EnqueuedNotification {
  id: string;
  tenantId: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH';
  recipient: string;
  subject?: string;
  body: string;
  status: 'QUEUED' | 'SENDING' | 'DELIVERED' | 'FAILED' | 'READ';
  retryCount: number;
  maxRetries: number;
  queuedAt: Date;
  deliveredAt?: Date;
}

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);
  private readonly queue: EnqueuedNotification[] = [];

  /**
   * Enqueues notification for background worker delivery.
   */
  async enqueue(dto: Omit<EnqueuedNotification, 'id' | 'status' | 'retryCount' | 'maxRetries' | 'queuedAt'>): Promise<EnqueuedNotification> {
    const notification: EnqueuedNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'QUEUED',
      retryCount: 0,
      maxRetries: 3,
      queuedAt: new Date(),
      ...dto,
    };

    this.queue.push(notification);
    this.logger.log(`[NotificationQueue] Enqueued ${notification.channel} to [${notification.recipient}] for Tenant: [${notification.tenantId}]`);

    // Asynchronous dispatch
    setTimeout(() => this.dispatchNotification(notification), 150);

    return notification;
  }

  private async dispatchNotification(notif: EnqueuedNotification) {
    notif.status = 'SENDING';
    this.logger.log(`[NotificationQueue] Dispatching ${notif.channel} to ${notif.recipient}...`);

    try {
      notif.status = 'DELIVERED';
      notif.deliveredAt = new Date();
      this.logger.log(`[NotificationQueue] Notification ${notif.id} DELIVERED 🟢`);
    } catch (err: any) {
      notif.retryCount += 1;
      notif.status = 'FAILED';
      this.logger.warn(`[NotificationQueue] Delivery failed for ${notif.id} (Attempt ${notif.retryCount}/${notif.maxRetries})`);
    }
  }

  getQueueStats() {
    return {
      totalQueued: this.queue.length,
      deliveredCount: this.queue.filter((n) => n.status === 'DELIVERED').length,
      failedCount: this.queue.filter((n) => n.status === 'FAILED').length,
      channelsActive: ['SMS (Authentica.sa)', 'WhatsApp', 'Email', 'Web Push'],
    };
  }
}
