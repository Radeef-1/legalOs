import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return system info', () => {
      const info = appController.getSystemInfo();
      expect(info).toHaveProperty('status', 'ONLINE');
      expect(info).toHaveProperty('platform', 'LegalOS Enterprise SaaS API');
    });

    it('should return health status', () => {
      const health = appController.getHealth();
      expect(health).toHaveProperty('status', 'UP');
      expect(health).toHaveProperty('service', 'legalos-api');
    });
  });
});
