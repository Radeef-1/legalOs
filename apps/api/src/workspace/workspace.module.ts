import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { BranchesService } from './branches/branches.service';
import { BranchesController } from './branches/branches.controller';
import { DepartmentsService } from './departments/departments.service';
import { DepartmentsController } from './departments/departments.controller';
import { TeamsService } from './teams/teams.service';
import { TeamsController } from './teams/teams.controller';
import { MembersService } from './members/members.service';
import { MembersController } from './members/members.controller';
import { InvitationsService } from './invitations/invitations.service';
import { InvitationsController } from './invitations/invitations.controller';
import { SettingsService } from './settings/settings.service';
import { SettingsController } from './settings/settings.controller';
import { OnboardingService } from './onboarding/onboarding.service';
import { OnboardingController } from './onboarding/onboarding.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    BranchesController,
    DepartmentsController,
    TeamsController,
    MembersController,
    InvitationsController,
    SettingsController,
    OnboardingController,
  ],
  providers: [
    BranchesService,
    DepartmentsService,
    TeamsService,
    MembersService,
    InvitationsService,
    SettingsService,
    OnboardingService,
  ],
  exports: [
    BranchesService,
    DepartmentsService,
    TeamsService,
    MembersService,
    InvitationsService,
    SettingsService,
    OnboardingService,
  ],
})
export class WorkspaceModule {}
