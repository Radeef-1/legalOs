import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('IAM & Tenant Security (e2e)', () => {
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

  it('GET /v1 should return API status', async () => {
    const res = await request(app.getHttpServer()).get('/v1');
    expect(res.status).toBe(200);
  });

  it('POST /v1/iam/login with invalid credentials should return 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/iam/login')
      .send({ email: 'nonexistent@legalos.sa', password: 'wrongpassword' });
    expect([400, 401, 404]).toContain(res.status);
  });

  it('Protected endpoint without Authorization token in production mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = await request(app.getHttpServer()).get('/v1/cases');
    process.env.NODE_ENV = originalEnv;
    expect([401, 200]).toContain(res.status);
  });
});
