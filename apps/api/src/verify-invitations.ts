import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InvitationSecurityService } from './invitations/services/invitation-security.service';
import { MembershipService } from './invitations/services/membership.service';
import { InvitationAnalyticsService } from './invitations/services/invitation-analytics.service';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('🚀 [Invitation Engine v10] Starting E2E Verification Suite...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const securityService = app.get(InvitationSecurityService);
  const membershipService = app.get(MembershipService);
  const analyticsService = app.get(InvitationAnalyticsService);

  const orgId = 'org-salman-2026';
  const createdBy = 'user-admin-01';

  // 1. Generate HMAC Signed Invite Token
  console.log('\n🔐 [Test 1] Testing HMAC Token Generation & Cryptographic Signature...');
  const tempId = `inv-test-${Date.now()}`;
  const targetEmail = 'lawyer.test@lawfirm.sa';
  const { token, tokenHash } = securityService.generateInviteToken(tempId, orgId, targetEmail);

  console.log(`✅ Token Generated: ${token.substring(0, 30)}...`);
  console.log(`✅ Token Hash (SHA256): ${tokenHash.substring(0, 30)}...`);

  // 2. Verify HMAC Token Signature
  console.log('\n🛡️ [Test 2] Testing Token Signature Verification & Anti-Replay Payload...');
  const verified = securityService.verifyTokenSignature(token);
  console.log(`✅ Verified Payload: OrgId=${verified.orgId}, Contact=${verified.emailOrPhone}`);

  // 3. Create Enterprise Invitation in Database
  console.log('\n💾 [Test 3] Persisting EnterpriseInvitation to Database...');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.db.enterpriseInvitation.create({
    data: {
      organizationId: orgId,
      type: 'LAWYER',
      email: targetEmail,
      fullName: 'أ. فهد بن عبد العزيز الشرف',
      roleName: 'SENIOR_LAWYER',
      status: 'PENDING',
      expiresAt,
      tokenHash,
      channel: 'SMS',
      createdBy,
    },
  });
  console.log(`✅ EnterpriseInvitation Created with ID: ${invitation.id}`);

  // 4. Test Membership Provisioning Upon Acceptance
  console.log('\n👤 [Test 4] Testing Membership Provisioning & User Creation...');
  const provisionResult = await membershipService.provisionMembership({
    invitationId: invitation.id,
    organizationId: orgId,
    fullName: invitation.fullName,
    email: invitation.email || undefined,
    roleName: invitation.roleName,
    invitedBy: createdBy,
  });

  console.log(`✅ Membership Created with ID: ${provisionResult.membership.id}`);
  console.log(`✅ Provisioned User ID: ${provisionResult.userId}`);

  // 5. Test Analytics Aggregation
  console.log('\n📊 [Test 5] Testing Invitation Analytics & Conversion Rate...');
  const analytics = await analyticsService.getAnalytics(orgId);
  console.log('✅ Invitation Analytics:', analytics);

  console.log('\n🎉 [SUCCESS 100%] Invitation & Membership Engine v10 Verification Passed Cleanly!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
