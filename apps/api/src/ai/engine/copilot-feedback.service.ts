import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';

export class SubmitFeedbackDto {
  messageId!: string;
  userRating!: number; // 1 to 5
  feedbackComment?: string;
}

@Injectable()
export class CopilotFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submits user feedback (thumbs up/down or rating) for a Copilot answer.
   */
  async submitFeedback(organizationId: string, userId: string, dto: SubmitFeedbackDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const message = await db.aiCopilotMessage.findFirst({
        where: { id: dto.messageId },
      });

      if (!message) {
        throw new NotFoundException(`الرسالة [${dto.messageId}] غير موجودة.`);
      }

      return db.aiCopilotMessage.update({
        where: { id: dto.messageId },
        data: {
          userRating: dto.userRating,
          feedbackComment: dto.feedbackComment || null,
        },
      });
    });
  }
}
