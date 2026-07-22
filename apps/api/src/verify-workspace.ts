import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { BranchesService } from './workspace/branches/branches.service';
import { DepartmentsService } from './workspace/departments/departments.service';
import { TeamsService } from './workspace/teams/teams.service';
import { MembersService } from './workspace/members/members.service';
import { InvitationsService } from './workspace/invitations/invitations.service';
import { SettingsService } from './workspace/settings/settings.service';
import { UserStatus } from '@prisma/client';

async function main() {
  console.log('--- Bootstrapping NestJS Context for Workspace Verification ---');
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const branchesService = app.get(BranchesService);
  const departmentsService = app.get(DepartmentsService);
  const teamsService = app.get(TeamsService);
  const membersService = app.get(MembersService);
  const invitationsService = app.get(InvitationsService);
  const settingsService = app.get(SettingsService);

  const tenantAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const partnerAId = '33333333-3333-3333-3333-333333333333'; // Lawyer A (Partner)

  const tenantBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const partnerBId = '44444444-4444-4444-4444-444444444444'; // Lawyer B (Partner)

  try {
    // Clean up previous run data
    await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
      await prisma.db.teamMember.deleteMany({});
      await prisma.db.team.deleteMany({});
      await prisma.db.department.deleteMany({});
      await prisma.db.branch.deleteMany({});
      await prisma.db.workspaceInvitation.deleteMany({});
      await prisma.db.organizationMember.deleteMany({ where: { id: { notIn: ['11111111-2222-3333-4444-555555555551', '11111111-2222-3333-4444-555555555552', '11111111-2222-3333-4444-555555555553'] } } });
      await prisma.user.deleteMany({ where: { email: 'invited.lawyer@firma.sa' } });
    });

    // ----------------------------------------------------
    // Scenario 1: Workspace Setting & Recalculating Statistics
    // ----------------------------------------------------
    console.log('\n[1] Starting Scenario: Manage Workspace settings & Recalculate Statistics');
    await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
      // 1. Get current settings
      const settings = await settingsService.getSettings();
      console.log(`- Retrieved branding primary color: ${settings.branding['primaryColor']} (Expected: #1A365D)`);

      // 2. Update settings
      await settingsService.updateSettings({
        branding: { primaryColor: '#2B6CB0' },
        localization: { defaultLanguage: 'en' },
      });
      const updated = await settingsService.getSettings();
      console.log(`- Updated branding primary color: ${updated.branding['primaryColor']} (Expected: #2B6CB0)`);
      console.log(`- Updated localization default language: ${updated.localization['defaultLanguage']} (Expected: en)`);

      // 3. Recalculate Stats
      const stats = await settingsService.getStatistics();
      console.log(`- Recalculated stats -> cases: ${stats.casesCount}, clients: ${stats.clientsCount}, members: ${stats.membersCount}`);
    });

    // ----------------------------------------------------
    // Scenario 2: Branches, Hierarchical Departments & Teams
    // ----------------------------------------------------
    console.log('\n[2] Starting Scenario: Manage Branches, Hierarchical Departments & Teams');
    let branchId = '';
    let deptId = '';
    let subDeptId = '';
    let teamId = '';

    await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
      // 1. Create branch
      const branch = await branchesService.create({
        name: 'Riyadh HQ Branch',
        city: 'Riyadh',
        isHeadOffice: true,
        latitude: 24.7136,
        longitude: 46.6753,
      });
      branchId = branch.id;
      console.log(`- Created branch "${branch.name}" (HQ: ${branch.isHeadOffice}, Lat: ${branch.latitude})`);

      // 2. Create hierarchical departments
      const parentDept = await departmentsService.create({
        name: 'Corporate & Commercial Law',
        description: 'Practice area representing corporate corporate legal operations',
      });
      deptId = parentDept.id;

      const subDept = await departmentsService.create({
        name: 'Mergers & Acquisitions',
        parentDepartmentId: deptId,
      });
      subDeptId = subDept.id;
      console.log(`- Created parent department "${parentDept.name}"`);
      console.log(`- Created sub department "${subDept.name}" under parent department ID: ${subDept.parentDepartmentId}`);

      // 3. Create nested teams
      const team = await teamsService.create({
        name: 'M&A Deal Team A',
        departmentId: subDeptId,
      });
      teamId = team.id;
      console.log(`- Created team "${team.name}" associated with department ID: ${team.departmentId}`);

      // Assign a member to the team
      const allMembers = await membersService.findAll();
      const firstMember = allMembers[0];

      await teamsService.assignMember(teamId, {
        memberId: firstMember.id,
        isLeader: true,
        title: 'Deal Lead Attorney',
        allocationType: 'Primary',
        allocationPercent: 80,
      });
      console.log(`- Assigned Member ${firstMember.user.fullName} as Leader of Team "${team.name}"`);
    });

    // ----------------------------------------------------
    // Scenario 3: Onboarding Member Invitation Acceptance Flow
    // ----------------------------------------------------
    console.log('\n[3] Starting Scenario: Onboarding Member Invitation Acceptance Flow');
    let invitationToken = '';

    await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
      const roles = await prisma.role.findMany({ where: { organizationId: tenantAId } });
      const associateRole = roles.find(r => r.name === 'Associate');

      if (!associateRole) {
        throw new Error('Associate role not found for Tenant A');
      }

      // Invite a new member
      const invitation = await invitationsService.createInvitation({
        email: 'invited.lawyer@firma.sa',
        roleId: associateRole.id,
        branchId: branchId,
        departmentId: deptId,
        teamId: teamId,
      });

      invitationToken = invitation.rawToken;
      console.log(`- Generated invitation link with token for email "invited.lawyer@firma.sa"`);
    });

    // User accepts invitation anonymously (no TenantContext needed during acceptance)
    console.log(`- Accept invitation token anonymously...`);
    const acceptResult = await invitationsService.acceptInvitation({
      token: invitationToken,
      fullName: 'Onboarded Associate Lawyer',
      password: 'password123',
    });

    console.log(`- Invitation ACCEPTED successfully! Created User ID: ${acceptResult.userId}, Member ID: ${acceptResult.memberId}`);

    // Verify member details in Tenant context
    await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
      const onboardingMember = await membersService.findOne(acceptResult.memberId);
      console.log(`- Verified Member profile: fullName: "${onboardingMember.user.fullName}"`);
      console.log(`- Verified Role: "${onboardingMember.role.name}" (Expected: Associate)`);
      console.log(`- Verified Department: "${onboardingMember.department?.name}" (Expected: Corporate & Commercial Law)`);
      console.log(`- Verified Branch: "${onboardingMember.branch?.name}" (Expected: Riyadh HQ Branch)`);

      // Verify auto-joined team membership
      const team = await teamsService.findOne(teamId);
      const isTeamJoined = team.members.some(tm => tm.memberId === acceptResult.memberId);
      console.log(`- Verified Team Membership: auto-joined "${team.name}": ${isTeamJoined}`);
    });

    // ----------------------------------------------------
    // Scenario 4: Tenant Isolation (RLS Security) Verification
    // ----------------------------------------------------
    console.log('\n[4] Starting Scenario: Tenant Isolation (RLS Security)');
    await TenantContext.run({ tenantId: tenantBId, userId: partnerBId, role: 'Partner' }, async () => {
      try {
        // Attempt to fetch Tenant A's branch
        console.log(`- Tenant B attempts to fetch Tenant A's branch ID ${branchId}...`);
        await branchesService.findOne(branchId);
        console.log('❌ Tenant isolation failure: Tenant B fetched Tenant A\'s branch!');
      } catch (err) {
        console.log(`- Success: Tenant B access to Tenant A's branch denied (Expected: ${err.message})`);
      }

      try {
        // Attempt to fetch Tenant A's department
        console.log(`- Tenant B attempts to fetch Tenant A's department ID ${deptId}...`);
        await departmentsService.findOne(deptId);
        console.log('❌ Tenant isolation failure: Tenant B fetched Tenant A\'s department!');
      } catch (err) {
        console.log(`- Success: Tenant B access to Tenant A's department denied (Expected: ${err.message})`);
      }

      try {
        // Attempt to fetch Tenant A's team
        console.log(`- Tenant B attempts to fetch Tenant A's team ID ${teamId}...`);
        await teamsService.findOne(teamId);
        console.log('❌ Tenant isolation failure: Tenant B fetched Tenant A\'s team!');
      } catch (err) {
        console.log(`- Success: Tenant B access to Tenant A's team denied (Expected: ${err.message})`);
      }
    });

    console.log('\n✅ All workspace scenarios verified successfully!');
  } catch (err) {
    console.error('❌ Verification Scenario failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

main();
