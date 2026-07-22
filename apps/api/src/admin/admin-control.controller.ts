import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../shared/guards/auth.guard';
import { AdminControlService } from './admin-control.service';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminControlController {
  constructor(private readonly adminControlService: AdminControlService) {}

  @Get('command-center')
  async getCommandCenter() {
    return this.adminControlService.getExecutiveCommandCenterData();
  }

  @Get('tenants')
  async getTenants() {
    return this.adminControlService.getTenantsList();
  }

  @Post('tenants')
  async createTenant(@Body() body: { name: string; slug: string; ownerName: string; ownerEmail: string; planTier?: string }) {
    const data = await this.adminControlService.createTenant(body);
    return {
      success: true,
      data,
    };
  }

  @Post('tenants/:id/impersonate')
  async impersonateTenant(@Param('id') id: string) {
    return this.adminControlService.impersonateTenant(id);
  }

  @Get('ai-center')
  async getAiCenter() {
    return this.adminControlService.getAiCenterStats();
  }

  @Post('ai-center/switch-provider')
  async switchAiProvider(@Body() body: { provider: string }) {
    return this.adminControlService.updateAiProvider(body.provider || 'SAUDI_LOCAL_LLM');
  }

  @Post('system-tool')
  async runSystemTool(@Body() body: { action: string }) {
    return this.adminControlService.runSystemTool(body.action || 'CACHE_FLUSH');
  }
}
