import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'prisma/config';

// .env 파일은 워크스페이스 루트(src/)에 있음
config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
