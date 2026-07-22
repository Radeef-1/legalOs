import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { AssignTeamMemberDto } from './dtos/assign-team-member.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workspace/teams')
@UseGuards(AuthGuard, PermissionsGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Permissions('workspace.manage')
  async create(@Body() createTeamDto: CreateTeamDto) {
    const data = await this.teamsService.create(createTeamDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  @Permissions('workspace.manage')
  async findAll() {
    const data = await this.teamsService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @Permissions('workspace.manage')
  async findOne(@Param('id') id: string) {
    const data = await this.teamsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @Permissions('workspace.manage')
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    const data = await this.teamsService.update(id, updateTeamDto);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @Permissions('workspace.manage')
  async remove(@Param('id') id: string) {
    const data = await this.teamsService.remove(id);
    return {
      success: true,
      data,
    };
  }

  @Post(':id/members')
  @Permissions('workspace.manage')
  async assignMember(@Param('id') teamId: string, @Body() dto: AssignTeamMemberDto) {
    const data = await this.teamsService.assignMember(teamId, dto);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id/members/:memberId')
  @Permissions('workspace.manage')
  async removeMember(@Param('id') teamId: string, @Param('memberId') memberId: string) {
    const data = await this.teamsService.removeMember(teamId, memberId);
    return {
      success: true,
      data,
    };
  }
}
