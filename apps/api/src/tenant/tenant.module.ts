import { Module } from '@nestjs/common';
import { TenantConfigController } from './tenant-config.controller';
import { TenantResolverService } from './services/tenant-resolver.service';
import { PrismaService } from '../shared/database/prisma.service';

@Module({
  controllers: [TenantConfigController],
  providers: [PrismaService, TenantResolverService],
  exports: [TenantResolverService],
})
export class TenantModule {}
