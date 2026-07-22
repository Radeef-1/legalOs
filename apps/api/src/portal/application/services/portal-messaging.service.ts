import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export class SendMessageDto {
  caseId?: string;
  content!: string;
  messageType?: 'TEXT' | 'FILE' | 'VOICE';
  fileUrl?: string;
}

@Injectable()
export class PortalMessagingService {
  private readonly logger = new Logger(PortalMessagingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sends a message from the client in the portal.
   */
  async sendMessage(organizationId: string, clientId: string, dto: SendMessageDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const message = await db.portalMessage.create({
        data: {
          organizationId,
          clientId,
          caseId: dto.caseId || null,
          senderType: 'CLIENT',
          content: dto.content,
          messageType: dto.messageType || 'TEXT',
          fileUrl: dto.fileUrl || null,
          isRead: false,
        },
      });

      this.logger.log(
        `[Portal Messaging] Client [${clientId}] sent message: "${dto.content.substring(0, 50)}..."`,
      );

      return message;
    });
  }

  /**
   * Sends a message from the lawyer/firm to the client.
   */
  async sendLawyerMessage(organizationId: string, clientId: string, dto: SendMessageDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.portalMessage.create({
        data: {
          organizationId,
          clientId,
          caseId: dto.caseId || null,
          senderType: 'LAWYER',
          content: dto.content,
          messageType: dto.messageType || 'TEXT',
          fileUrl: dto.fileUrl || null,
          isRead: false,
        },
      });
    });
  }

  /**
   * Gets all messages for a client, optionally filtered by case.
   */
  async getMessages(organizationId: string, clientId: string, caseId?: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.portalMessage.findMany({
        where: {
          organizationId,
          clientId,
          ...(caseId ? { caseId } : {}),
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  }

  /**
   * Marks a message as read.
   */
  async markAsRead(organizationId: string, clientId: string, messageId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const message = await db.portalMessage.findFirst({
        where: { id: messageId, organizationId, clientId },
      });

      if (!message) {
        throw new NotFoundException(`الرسالة [${messageId}] غير موجودة.`);
      }

      return db.portalMessage.update({
        where: { id: messageId },
        data: { isRead: true },
      });
    });
  }

  /**
   * Marks all lawyer messages as read for a client.
   */
  async markAllAsRead(organizationId: string, clientId: string, caseId?: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.portalMessage.updateMany({
        where: {
          organizationId,
          clientId,
          senderType: 'LAWYER',
          isRead: false,
          ...(caseId ? { caseId } : {}),
        },
        data: { isRead: true },
      });
    });
  }

  /**
   * Gets unread messages count for the client.
   */
  async getUnreadCount(organizationId: string, clientId: string): Promise<number> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.portalMessage.count({
        where: {
          organizationId,
          clientId,
          senderType: 'LAWYER',
          isRead: false,
        },
      });
    });
  }
}
