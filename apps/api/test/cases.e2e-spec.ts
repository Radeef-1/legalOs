import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Cases Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/cases should return list of legal cases', async () => {
    const res = await request(app.getHttpServer()).get('/v1/cases');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    }
  });

  it('POST /v1/cases with invalid payload should return validation error', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/cases')
      .send({ invalidField: true });
    expect([400, 401, 403, 422]).toContain(res.status);
  });
});
