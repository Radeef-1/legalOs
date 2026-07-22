import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { PolicyEngineService } from './policy.engine';
import { PolicyGuard } from './guards/policy.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PolicyEngineService, PolicyGuard],
  exports: [PolicyEngineService, PolicyGuard],
})
export class PolicyModule {}
