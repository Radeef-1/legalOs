import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getSystemInfo() {
    return {
      status: 'ONLINE',
      platform: 'LegalOS Enterprise SaaS API',
      version: 'v2.8.0',
      timestamp: new Date().toISOString(),
      architecture: {
        pattern: 'Modular Monolith + DDD Bounded Contexts',
        multiTenant: 'PostgreSQL Row-Level Security (RLS)',
        authorization: 'RBAC + Dynamic ABAC Policy Engine',
        messaging: 'Transactional Outbox + Multi-Consumer Event Bus',
      },
      availableModules: [
        'IAM & Auth (`/iam`)',
        'Workspace Foundations (`/workspace`)',
        'ABAC Policy Engine (`/shared/policy`)',
        'Workspace Finance Domain (`/finance`)',
        'Calendar Domain (`/calendar`)',
        'Enterprise Workflow & BPM Engine (`/workflow`)',
      ],
      note: 'Protected API endpoints require Authorization: Bearer <token> and tenant header.',
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'UP', service: 'legalos-api', uptime: process.uptime() };
  }
}
