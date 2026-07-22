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

@Module({
  imports: [PrismaModule],
  controllers: [
    BranchesController,
    DepartmentsController,
    TeamsController,
    MembersController,
    InvitationsController,
    SettingsController,
  ],
  providers: [
    BranchesService,
    DepartmentsService,
    TeamsService,
    MembersService,
    InvitationsService,
    SettingsService,
  ],
  exports: [
    BranchesService,
    DepartmentsService,
    TeamsService,
    MembersService,
    InvitationsService,
    SettingsService,
  ],
})
export class WorkspaceModule {}
