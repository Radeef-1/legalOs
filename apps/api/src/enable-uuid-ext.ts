import { Client } from 'pg';

async function enableUuidExtension() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_e0jv5PiYAFWu@ep-green-king-axsh9ysm.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';
  console.log('Connecting to Neon database to enable uuid-ossp extension...');

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    console.log('✔ PostgreSQL "uuid-ossp" and "pgcrypto" extensions enabled successfully on Neon Database!');
  } catch (err: any) {
    console.error('❌ Failed to enable extension:', err.message);
  } finally {
    await client.end();
  }
}

enableUuidExtension();
