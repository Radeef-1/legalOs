import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { AdminSecurityService } from './security/admin-security.service';
import { AdminSecurityController } from './security/admin-security.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'super-secret-key-legalos-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController, AdminSecurityController],
  providers: [AuthService, AdminSecurityService],
  exports: [AuthService, AdminSecurityService],
})
export class IamModule {}
