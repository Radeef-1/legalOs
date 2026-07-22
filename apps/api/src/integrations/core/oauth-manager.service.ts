import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { SecretVaultService } from './secret-vault.service';
import { ProviderRegistryService } from './provider-registry.service';
import { ConnectionStatus } from '@prisma/client';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Injectable()
export class OAuthManagerService {
  private readonly logger = new Logger(OAuthManagerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vaultService: SecretVaultService,
    private readonly providerRegistry: ProviderRegistryService,
  ) {}

  async saveConnection(
    organizationId: string,
    providerCode: string,
    credentialsObj: Record<string, any>,
    metadataJson?: Record<string, any>,
  ) {
    const provider = await this.providerRegistry.getProviderByCode(providerCode);
    if (!provider) {
      throw new NotFoundException(`Integration Provider "${providerCode}" not found.`);
    }

    const encryptedVault = this.vaultService.encrypt(credentialsObj);

    return TenantContext.run({ tenantId: organizationId }, async () => {
      const connection = await this.prisma.db.integrationConnection.upsert({
        where: {
          organizationId_providerId: {
            organizationId,
            providerId: provider.id,
          },
        },
        create: {
          organizationId,
          providerId: provider.id,
          status: ConnectionStatus.CONNECTED,
          encryptedVault,
          metadataJson: metadataJson || null,
          lastHealthCheck: new Date(),
        },
        update: {
          status: ConnectionStatus.CONNECTED,
          encryptedVault,
          metadataJson: metadataJson || null,
          lastHealthCheck: new Date(),
        },
      });

      // Audit Log
      await this.prisma.db.integrationLog.create({
        data: {
          connectionId: connection.id,
          action: 'SAVE_CONNECTION',
          status: 'SUCCESS',
          requestJson: { providerCode, authType: provider.authType },
          responseJson: { connectionId: connection.id, status: connection.status },
        },
      });

      return connection;
    });
  }

  async getDecryptedCredentials(connectionId: string): Promise<Record<string, any>> {
    const connection = await this.prisma.db.integrationConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException(`Integration Connection "${connectionId}" not found.`);
    }

    const credentials = this.vaultService.decrypt(connection.encryptedVault);

    // Auto-refresh token if expired (simulated for OAuth2)
    if (credentials.expiresAt && new Date(credentials.expiresAt).getTime() < Date.now()) {
      this.logger.log(`OAuth Token expired for Connection [${connectionId}]. Refreshing token...`);
      credentials.accessToken = `refreshed_access_token_${Date.now()}`;
      credentials.expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

      // Re-encrypt and save updated vault
      const updatedVault = this.vaultService.encrypt(credentials);
      await this.prisma.db.integrationConnection.update({
        where: { id: connectionId },
        data: {
          encryptedVault: updatedVault,
          lastSyncedAt: new Date(),
        },
      });
    }

    return credentials;
  }
}
