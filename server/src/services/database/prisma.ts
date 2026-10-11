import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be configured to start the server.');
}

const connectionUrl = new URL(databaseUrl);
if (!connectionUrl.searchParams.has('connection_limit')) {
  connectionUrl.searchParams.set('connection_limit', '1');
}

export const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl.toString() } },
});
