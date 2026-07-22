import { Module } from '@nestjs/common';
import { ClientsService } from './application/clients.service';
import { ClientsController } from './presentation/clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class CrmModule {}
