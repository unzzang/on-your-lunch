import { config } from 'dotenv';
import { resolve } from 'path';

// 루트 .env에서 DATABASE_URL 읽기
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient, PriceRange, DataSource } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 식당 데이터 정의 (카테고리명으로 참조, DB에서 ID 조회하여 사용)
const restaurantData = [
  // ── 한식 3개 ──
  {
    categoryName: '한식',
    name: '명동할머니국수',
    address: '서울 강남구 역삼동 825-5',
    latitude: 37.4985,
    longitude: 127.0292,
    phone: '02-555-1234',
    description: '30년 전통 칼국수와 수육이 유명한 역삼역 맛집',
    priceRange: PriceRange.UNDER_10K,
    businessHours: '11:00~21:00 (일요일 휴무)',
    menus: [
      { name: '칼국수', price: 8000, sortOrder: 1 },
      { name: '수육 (소)', price: 18000, sortOrder: 2 },
      { name: '비빔국수', price: 8000, sortOrder: 3 },
    ],
  },
  {
    categoryName: '한식',
    name: '진미평양냉면',
    address: '서울 강남구 역삼동 832-3',
    latitude: 37.4998,
    longitude: 127.0285,
    phone: '02-556-7890',
    description: '여름 겨울 가리지 않는 정통 평양냉면 전문점',
    priceRange: PriceRange.BETWEEN_10K_20K,
    businessHours: '11:00~21:30 (월요일 휴무)',
    menus: [
      { name: '평양냉면', price: 12000, sortOrder: 1 },
      { name: '만둣국', price: 10000, sortOrder: 2 },
      { name: '수육', price: 25000, sortOrder: 3 },
    ],
  },
  {
    categoryName: '한식',
    name: '서래갈매기',
    address: '서울 강남구 테헤란로14길 12',
    latitude: 37.4975,
    longitude: 127.0340,
    phone: '02-538-3456',
    description: '강남 직장인들이 점심 회식으로 즐겨 찾는 갈매기살 전문점',
    priceRange: PriceRange.BETWEEN_10K_20K,
    businessHours: '11:30~22:00 (연중무휴)',
    menus: [
      { name: '갈매기살 1인', price: 14000, sortOrder: 1 },
      { name: '된장찌개', price: 7000, sortOrder: 2 },
    ],
  },

  // ── 중식 1개 ──
  {
    categoryName: '중식',
    name: '홍보석',
    address: '서울 강남구 테헤란로 121',
    latitude: 37.5001,
    longitude: 127.0330,
    phone: '02-555-8888',
    description: '탕수육과 짜장면이 맛있는 역삼역 중식당',
    priceRange: PriceRange.BETWEEN_10K_20K,
    businessHours: '11:00~21:00 (일요일 휴무)',
    menus: [
      { name: '짜장면', price: 8000, sortOrder: 1 },
      { name: '짬뽕', price: 9000, sortOrder: 2 },
      { name: '탕수육 (소)', price: 18000, sortOrder: 3 },
    ],
  },

  // ── 일식 2개 ──
  {
    categoryName: '일식',
    name: '스시마루',
    address: '서울 강남구 테헤란로 152',
    latitude: 37.5005,
    longitude: 127.0380,
    phone: '02-501-2345',
    description: '합리적인 가격의 런치 초밥 세트가 인기인 선릉역 맛집',
    priceRange: PriceRange.BETWEEN_10K_20K,
    businessHours: '11:30~22:00 (일요일 휴무)',
    menus: [
      { name: '런치 초밥 세트 (12p)', price: 15000, sortOrder: 1 },
      { name: '사시미 모둠', price: 28000, sortOrder: 2 },
      { name: '우동', price: 9000, sortOrder: 3 },
    ],
  },
  {
    categoryName: '일식',
    name: '우동카덴',
    address: '서울 강남구 역삼동 811-12',
    latitude: 37.4968,
    longitude: 127.0310,
    phone: '02-557-6543',
    description: '직접 뽑은 면이 쫄깃한 수제 우동 전문점',
    priceRange: PriceRange.UNDER_10K,
    businessHours: '11:00~20:30 (토일 휴무)',
    menus: [
      { name: '가케우동', price: 8500, sortOrder: 1 },
      { name: '붓카게우동', price: 9500, sortOrder: 2 },
    ],
  },

  // ── 양식 2개 ──
  {
    categoryName: '양식',
    name: '빌즈버거',
    address: '서울 강남구 논현로85길 15',
    latitude: 37.4988,
    longitude: 127.0365,
    phone: '02-518-9012',
    description: '수제 패티와 브리오슈 번이 조화로운 프리미엄 버거집',
    priceRange: PriceRange.BETWEEN_10K_20K,
    businessHours: '11:00~21:00 (연중무휴)',
    menus: [
      { name: '클래식 치즈버거', price: 13000, sortOrder: 1 },
      { name: '베이컨 더블버거', price: 16000, sortOrder: 2 },
      { name: '트러플 감자튀김', price: 6000, sortOrder: 3 },
    ],
  },
  {
    categoryName: '양식',
    name: '라스텔라',
    address: '서울 강남구 테헤란로 115',
    latitude: 37.4992,
    longitude: 127.0270,
    phone: '02-553-3210',
    description: '화덕 피자와 생면 파스타가 맛있는 강남역 이탈리안',
    priceRange: PriceRange.OVER_20K,
    businessHours: '11:30~22:00 (월요일 휴무)',
    menus: [
      { name: '마르게리타 피자', price: 18000, sortOrder: 1 },
      { name: '봉골레 파스타', price: 16000, sortOrder: 2 },
      { name: '티라미수', price: 8000, sortOrder: 3 },
    ],
  },

  // ── 아시안 2개 ──
  {
    categoryName: '아시안',
    name: '포36',
    address: '서울 강남구 역삼동 826-37',
    latitude: 37.4973,
    longitude: 127.0298,
    phone: '02-554-3636',
    description: '하노이 스타일 쌀국수를 즐길 수 있는 베트남 음식점',
    priceRange: PriceRange.UNDER_10K,
    businessHours: '10:30~21:00 (연중무휴)',
    menus: [
      { name: '소고기 쌀국수', price: 9500, sortOrder: 1 },
      { name: '분짜', price: 10000, sortOrder: 2 },
      { name: '월남쌈', price: 8000, sortOrder: 3 },
    ],
  },
  {
    categoryName: '아시안',
    name: '방콕가든',
    address: '서울 강남구 선릉로 428',
    latitude: 37.5010,
    longitude: 127.0395,
    phone: '02-501-7777',
    description: '팟타이와 톰양꿍이 현지 맛 그대로인 태국 음식점',
    priceRange: PriceRange.BETWEEN_10K_20K,
    businessHours: '11:00~21:30 (일요일 휴무)',
    menus: [
      { name: '팟타이', price: 11000, sortOrder: 1 },
      { name: '톰양꿍', price: 13000, sortOrder: 2 },
    ],
  },

  // ── 분식/간편식 2개 ──
  {
    categoryName: '분식/간편식',
    name: '신전떡볶이 강남역점',
    address: '서울 강남구 강남대로 396',
    latitude: 37.4965,
    longitude: 127.0278,
    phone: '02-559-1234',
    description: '빠르고 저렴하게 한 끼 해결하기 좋은 분식집',
    priceRange: PriceRange.UNDER_10K,
    businessHours: '10:00~22:00 (연중무휴)',
    menus: [
      { name: '떡볶이', price: 4500, sortOrder: 1 },
      { name: '튀김 세트', price: 5000, sortOrder: 2 },
      { name: '순대', price: 4000, sortOrder: 3 },
    ],
  },
  {
    categoryName: '분식/간편식',
    name: '김밥천국 역삼점',
    address: '서울 강남구 역삼동 830-14',
    latitude: 37.4990,
    longitude: 127.0305,
    phone: '02-556-0000',
    description: '저렴하고 빠르게 다양한 메뉴를 즐길 수 있는 곳',
    priceRange: PriceRange.UNDER_10K,
    businessHours: '06:00~23:00 (연중무휴)',
    menus: [
      { name: '참치김밥', price: 4000, sortOrder: 1 },
      { name: '김치찌개', price: 7000, sortOrder: 2 },
    ],
  },

  // ── 샐러드/건강식 1개 ──
  {
    categoryName: '샐러드/건강식',
    name: '프레시코드 강남점',
    address: '서울 강남구 테헤란로 134',
    latitude: 37.5002,
    longitude: 127.0355,
    phone: '02-501-5555',
    description: '신선한 재료로 만든 커스텀 샐러드와 포케 전문점',
    priceRange: PriceRange.BETWEEN_10K_20K,
    businessHours: '10:00~20:00 (토일 휴무)',
    menus: [
      { name: '시그니처 샐러드', price: 11500, sortOrder: 1 },
      { name: '연어 포케볼', price: 13000, sortOrder: 2 },
      { name: '닭가슴살 샐러드', price: 10500, sortOrder: 3 },
    ],
  },
];

async function main() {
  console.log('식당 더미 데이터 시드를 시작합니다...\n');

  // 1. DB에서 카테고리 조회 (이름 → ID 매핑)
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    throw new Error('카테고리가 0건입니다. 먼저 seed.ts를 실행해주세요.');
  }

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat.name, cat.id);
  }
  console.log(`카테고리 ${categories.length}건 조회 완료: ${categories.map((c) => c.name).join(', ')}`);

  // 2. 식당 + 메뉴 생성
  let createdCount = 0;
  for (const data of restaurantData) {
    const categoryId = categoryMap.get(data.categoryName);
    if (!categoryId) {
      console.warn(`[건너뜀] 카테고리 "${data.categoryName}"을 DB에서 찾을 수 없습니다.`);
      continue;
    }

    // 이미 같은 이름의 식당이 있으면 건너뜀 (중복 실행 방지)
    const existing = await prisma.restaurant.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      console.log(`[건너뜀] "${data.name}" — 이미 존재합니다.`);
      continue;
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        categoryId,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        description: data.description,
        priceRange: data.priceRange,
        businessHours: data.businessHours,
        dataSource: DataSource.MANUAL,
        isUserCreated: false,
        isClosed: false,
        menus: {
          create: data.menus,
        },
      },
    });

    createdCount++;
    console.log(`[생성] ${data.categoryName} > ${restaurant.name} (메뉴 ${data.menus.length}개)`);
  }

  console.log(`\n식당 ${createdCount}건 생성 완료 (총 ${restaurantData.length}건 중).`);
}

main()
  .catch((e) => {
    console.error('시드 실행 중 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
