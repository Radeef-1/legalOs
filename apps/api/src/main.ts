import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security: Helmet (HTTP Security Headers) ──
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.authentica.sa", "https://*.legalos.sa"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // ── Security: CORS — Restricted Origins (NO wildcard in production) ──
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://legalos.sa',
        'https://*.legalos.sa',
        'https://app.legalos.sa',
      ]
    : [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://127.0.0.1:3001',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, Postman)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) =>
        allowed.includes('*')
          ? origin.endsWith(allowed.replace('https://*', ''))
          : origin === allowed,
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Subdomain', 'X-Request-ID'],
    maxAge: 86400,
  });

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`LegalOS Backend API running on port ${port}/v1 [${process.env.NODE_ENV || 'development'}]`);
}
bootstrap();
