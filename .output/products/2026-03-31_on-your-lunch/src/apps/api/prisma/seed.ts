import { config } from 'dotenv';
import { resolve } from 'path';

// 루트 .env에서 DATABASE_URL 읽기
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─────────────────────────────────────
  // 카테고리 7건 (ERD 2.4절)
  // ─────────────────────────────────────
  const categories = [
    { name: '한식', colorCode: '#FF8C00', sortOrder: 1 },
    { name: '중식', colorCode: '#FF0000', sortOrder: 2 },
    { name: '일식', colorCode: '#0066FF', sortOrder: 3 },
    { name: '양식', colorCode: '#00AA00', sortOrder: 4 },
    { name: '아시안', colorCode: '#9900CC', sortOrder: 5 },
    { name: '분식/간편식', colorCode: '#FFCC00', sortOrder: 6 },
    { name: '샐러드/건강식', colorCode: '#66CC00', sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`카테고리 ${categories.length}건 입력 완료`);

  // ─────────────────────────────────────
  // 알레르기 6건 (ERD 2.5절)
  // ─────────────────────────────────────
  const allergies = [
    { name: '갑각류', sortOrder: 1 },
    { name: '견과류', sortOrder: 2 },
    { name: '유제품', sortOrder: 3 },
    { name: '밀', sortOrder: 4 },
    { name: '달걀', sortOrder: 5 },
    { name: '대두', sortOrder: 6 },
  ];

  for (const allergy of allergies) {
    await prisma.allergyType.upsert({
      where: { name: allergy.name },
      update: {},
      create: allergy,
    });
  }
  console.log(`알레르기 ${allergies.length}건 입력 완료`);

  console.log('시드 데이터 입력 완료.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
