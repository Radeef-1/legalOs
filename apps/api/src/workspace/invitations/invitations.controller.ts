import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { AcceptInvitationDto } from './dtos/accept-invitation.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workspace/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('workspace.manage')
  async create(@Body() createInvitationDto: CreateInvitationDto) {
    const data = await this.invitationsService.createInvitation(createInvitationDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('workspace.manage')
  async findAll() {
    const data = await this.invitationsService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Post('accept')
  async accept(@Body() acceptInvitationDto: AcceptInvitationDto) {
    const data = await this.invitationsService.acceptInvitation(acceptInvitationDto);
    return {
      success: true,
      message: 'تم قبول الدعوة وتسجيل الدخول بنجاح',
      data,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('workspace.manage')
  async revoke(@Param('id') id: string) {
    const data = await this.invitationsService.revokeInvitation(id);
    return {
      success: true,
      data,
    };
  }
}
