import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { PublicInvitationsController } from './public-invitations.controller';
import { InvitationSecurityService } from './services/invitation-security.service';
import { InvitationDeliveryService } from './services/invitation-delivery.service';
import { MembershipService } from './services/membership.service';
import { InvitationAnalyticsService } from './services/invitation-analytics.service';
import { PrismaService } from '../shared/database/prisma.service';

@Module({
  controllers: [InvitationsController, PublicInvitationsController],
  providers: [
    PrismaService,
    InvitationSecurityService,
    InvitationDeliveryService,
    MembershipService,
    InvitationAnalyticsService,
  ],
  exports: [
    InvitationSecurityService,
    InvitationDeliveryService,
    MembershipService,
    InvitationAnalyticsService,
  ],
})
export class InvitationsModule {}
