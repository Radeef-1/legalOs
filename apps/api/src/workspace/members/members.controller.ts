import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dtos/update-member.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workspace/members')
@UseGuards(AuthGuard, PermissionsGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Permissions('workspace.manage')
  async createMember(@Body() body: { fullName: string; email: string; password?: string; jobTitle?: string; roleName?: string }) {
    const data = await this.membersService.createMember(body);
    return {
      success: true,
      data,
    };
  }

  @Get()
  @Permissions('workspace.manage')
  async findAll() {
    const data = await this.membersService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @Permissions('workspace.manage')
  async findOne(@Param('id') id: string) {
    const data = await this.membersService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @Permissions('workspace.manage')
  async updateMember(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    const data = await this.membersService.updateMember(id, dto);
    return {
      success: true,
      data,
    };
  }

  @Get(':id/preferences')
  @Permissions('workspace.manage')
  async getPreferences(@Param('id') memberId: string) {
    const data = await this.membersService.getPreferences(memberId);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/preferences')
  @Permissions('workspace.manage')
  async updatePreferences(@Param('id') memberId: string, @Body() dto: UpdatePreferencesDto) {
    const data = await this.membersService.updatePreferences(memberId, dto);
    return {
      success: true,
      data,
    };
  }
}
