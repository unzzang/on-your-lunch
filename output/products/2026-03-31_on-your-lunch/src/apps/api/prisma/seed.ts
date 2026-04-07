import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient, PriceRange, DataSource } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 카테고리 7건
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

  // 알레르기 6건
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

  // 카테고리별 Unsplash 썸네일 이미지
  const categoryThumbnails: Record<string, string> = {
    '한식': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    '중식': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
    '일식': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    '양식': 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
    '아시안': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    '분식/간편식': 'https://images.unsplash.com/photo-1553978578-406092f35d14?w=400&h=300&fit=crop',
    '샐러드/건강식': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  };

  // 테스트 식당 데이터 (강남역 근처)
  const categoryMap = new Map<string, string>();
  const allCats = await prisma.category.findMany();
  for (const c of allCats) {
    categoryMap.set(c.name, c.id);
  }

  const restaurants = [
    {
      name: '명동할머니국수',
      categoryName: '한식',
      thumbnailUrl: categoryThumbnails['한식'],
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
      name: '진미평양냉면',
      categoryName: '한식',
      thumbnailUrl: categoryThumbnails['한식'],
      address: '서울 강남구 역삼동 832-3',
      latitude: 37.4998,
      longitude: 127.0285,
      phone: '02-556-7890',
      description: '정통 평양냉면 전문점',
      priceRange: PriceRange.BETWEEN_10K_20K,
      businessHours: '11:00~21:30 (월요일 휴무)',
      menus: [
        { name: '평양냉면', price: 12000, sortOrder: 1 },
        { name: '만둣국', price: 10000, sortOrder: 2 },
      ],
    },
    {
      name: '홍보석',
      categoryName: '중식',
      thumbnailUrl: categoryThumbnails['중식'],
      address: '서울 강남구 테헤란로 121',
      latitude: 37.5001,
      longitude: 127.0330,
      phone: '02-555-8888',
      description: '탕수육과 짜장면이 맛있는 중식당',
      priceRange: PriceRange.BETWEEN_10K_20K,
      businessHours: '11:00~21:00 (일요일 휴무)',
      menus: [
        { name: '짜장면', price: 8000, sortOrder: 1 },
        { name: '탕수육 (소)', price: 18000, sortOrder: 2 },
      ],
    },
    {
      name: '스시요시',
      categoryName: '일식',
      thumbnailUrl: categoryThumbnails['일식'],
      address: '서울 강남구 역삼동 830-10',
      latitude: 37.4990,
      longitude: 127.0310,
      phone: '02-557-4567',
      description: '합리적인 가격의 초밥 세트',
      priceRange: PriceRange.BETWEEN_10K_20K,
      businessHours: '11:30~21:00 (연중무휴)',
      menus: [
        { name: '런치 초밥 세트', price: 15000, sortOrder: 1 },
        { name: '우동', price: 9000, sortOrder: 2 },
      ],
    },
    {
      name: '파스타앤코',
      categoryName: '양식',
      thumbnailUrl: categoryThumbnails['양식'],
      address: '서울 강남구 테헤란로14길 8',
      latitude: 37.4972,
      longitude: 127.0345,
      phone: '02-538-1234',
      description: '직장인 점심 파스타 전문점',
      priceRange: PriceRange.BETWEEN_10K_20K,
      businessHours: '11:00~21:00 (토일 휴무)',
      menus: [
        { name: '토마토 파스타', price: 12000, sortOrder: 1 },
        { name: '크림 파스타', price: 13000, sortOrder: 2 },
      ],
    },
    {
      name: '쌀국수 하노이',
      categoryName: '아시안',
      thumbnailUrl: categoryThumbnails['아시안'],
      address: '서울 강남구 역삼동 828-1',
      latitude: 37.4988,
      longitude: 127.0275,
      phone: '02-559-3210',
      description: '베트남 현지 맛 쌀국수',
      priceRange: PriceRange.UNDER_10K,
      businessHours: '10:30~21:00 (연중무휴)',
      menus: [
        { name: '쌀국수', price: 9000, sortOrder: 1 },
        { name: '분짜', price: 10000, sortOrder: 2 },
      ],
    },
    {
      name: '김밥천국 역삼점',
      categoryName: '분식/간편식',
      thumbnailUrl: categoryThumbnails['분식/간편식'],
      address: '서울 강남구 역삼동 835-2',
      latitude: 37.4995,
      longitude: 127.0268,
      phone: '02-556-0000',
      description: '빠르고 저렴한 분식',
      priceRange: PriceRange.UNDER_10K,
      businessHours: '06:00~23:00 (연중무휴)',
      menus: [
        { name: '참치김밥', price: 4500, sortOrder: 1 },
        { name: '라볶이', price: 5500, sortOrder: 2 },
      ],
    },
    {
      name: '샐러디 역삼점',
      categoryName: '샐러드/건강식',
      thumbnailUrl: categoryThumbnails['샐러드/건강식'],
      address: '서울 강남구 테헤란로 130',
      latitude: 37.5003,
      longitude: 127.0298,
      phone: '02-557-9999',
      description: '신선한 샐러드 전문점',
      priceRange: PriceRange.UNDER_10K,
      businessHours: '08:00~20:00 (주말 휴무)',
      menus: [
        { name: '클래식 샐러드', price: 8900, sortOrder: 1 },
        { name: '닭가슴살 샐러드', price: 9900, sortOrder: 2 },
      ],
    },
  ];

  for (const r of restaurants) {
    const categoryId = categoryMap.get(r.categoryName);
    if (!categoryId) continue;

    const existing = await prisma.restaurant.findFirst({
      where: { name: r.name, address: r.address },
    });
    if (existing) {
      // 기존 식당의 thumbnailUrl 업데이트
      if (!existing.thumbnailUrl && r.thumbnailUrl) {
        await prisma.restaurant.update({
          where: { id: existing.id },
          data: { thumbnailUrl: r.thumbnailUrl },
        });
      }
      continue;
    }

    await prisma.restaurant.create({
      data: {
        name: r.name,
        categoryId,
        thumbnailUrl: r.thumbnailUrl,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        phone: r.phone,
        description: r.description,
        priceRange: r.priceRange,
        businessHours: r.businessHours,
        dataSource: DataSource.MANUAL,
        menus: {
          create: r.menus,
        },
      },
    });
  }
  console.log(`기본 식당 ${restaurants.length}건 입력 완료`);

  // 대량 테스트 식당 200건 생성 (강남역/역삼역/선릉역 주변)
  const bulkNames: Record<string, string[]> = {
    '한식': ['순대국밥','된장찌개집','백반집','김치찌개','설렁탕','갈비탕','비빔밥','육개장','해장국','부대찌개','삼겹살','돼지국밥','제육볶음','추어탕','감자탕','수제비','콩국수','불고기','닭볶음탕','보쌈','족발','곰탕','떡갈비','도시락','한정식','우거지탕','청국장','닭갈비','오리주물럭','소머리국밥','쌈밥','누룽지탕','곱창전골','낙지볶음','아구찜','갈치조림','고등어조림','묵사발','잔치국수','칼국수'],
    '중식': ['짬뽕전문','마라탕','딤섬하우스','양꼬치','훠궈','중화요리','유니짜장','깐풍기','마파두부','볶음밥','짜장면집','탕수육전문','마라샹궈','동파육','깐쇼새우','중식뷔페','양장피','해물짬뽕','고추잡채','유린기','꿔바로우','소롱포','만두전문','멘보샤','라조기','팔보채','잡채밥','울면','짬짜면','사천탕면'],
    '일식': ['라멘집','돈카츠','우동집','소바','규동','초밥','사시미','이자카야','카레','오코노미야키','텐동','야끼토리','메밀국수','장어덮밥','가츠동','규카츠','스시오마카세','일식정식','타코야끼','모밀','치라시','가라아게','규니쿠','돈부리','에비후라이','히레카츠','시오라멘','츠케멘','미소라멘','돈코츠라멘'],
    '양식': ['파스타집','피자','스테이크','버거','브런치','리조또','샌드위치','오믈렛','그라탕','수프카페','양식당','비스트로','트라토리아','함박스테이크','돈까스양식','크로크무슈','라자냐','뇨끼','타코','부리또','에그베네딕트','크로와상','키슈','갈릭바게트','수제버거','치즈플래터'],
    '아시안': ['태국식당','베트남쌀국수','인도카레','똠얌꿍','팟타이','카오팟','반미','분보후에','커리하우스','난전문','탄두리','텐더치킨','나시고렝','미고렝','카야토스트','싱가포르칠리크랩','라크사','포보','반쎄오','월남쌈','카레우동','그린커리','레드커리','마살라','비리야니','사테이'],
    '분식/간편식': ['떡볶이집','라면전문','김밥천국','만두집','핫도그','토스트','주먹밥','우동전문','순대','어묵바','닭강정','튀김전문','붕어빵','꽈배기','호떡','타코야끼분식','컵밥','도넛','와플','크레페'],
    '샐러드/건강식': ['샐러드바','포케','건강도시락','그래놀라카페','스무디바','아사이볼','비건식당','두부전문','현미밥집','저탄수화물','단백질식당','퀴노아','연어포케','치킨샐러드','오트밀카페','주스바','디톡스','영양죽','두유전문','곡물카페'],
  };

  const areas = [
    { name: '강남역', baseLat: 37.4979, baseLng: 127.0276 },
    { name: '역삼역', baseLat: 37.5007, baseLng: 127.0368 },
    { name: '선릉역', baseLat: 37.5045, baseLng: 127.0490 },
    { name: '삼성역', baseLat: 37.5088, baseLng: 127.0630 },
    { name: '테헤란로', baseLat: 37.5020, baseLng: 127.0410 },
  ];

  const priceRanges = [PriceRange.UNDER_10K, PriceRange.BETWEEN_10K_20K, PriceRange.OVER_20K];
  const hoursOptions = [
    '11:00~21:00 (일요일 휴무)',
    '11:00~22:00 (연중무휴)',
    '10:30~21:30 (월요일 휴무)',
    '11:30~20:30 (토일 휴무)',
    '08:00~21:00 (연중무휴)',
  ];

  let bulkCount = 0;
  const catNames = Object.keys(bulkNames);

  for (let i = 0; i < catNames.length; i++) {
    const catName = catNames[i];
    const names = bulkNames[catName];
    const categoryId = categoryMap.get(catName);
    if (!categoryId) continue;

    for (let j = 0; j < names.length; j++) {
      const area = areas[(i * names.length + j) % areas.length];
      const latOffset = (Math.random() - 0.5) * 0.008;
      const lngOffset = (Math.random() - 0.5) * 0.008;
      const storeName = `${names[j]} ${area.name}점`;
      const price = priceRanges[(i + j) % priceRanges.length];

      const existing = await prisma.restaurant.findFirst({
        where: { name: storeName },
      });
      if (existing) {
        if (!existing.thumbnailUrl) {
          await prisma.restaurant.update({
            where: { id: existing.id },
            data: { thumbnailUrl: categoryThumbnails[catName] },
          });
        }
        continue;
      }

      await prisma.restaurant.create({
        data: {
          name: storeName,
          categoryId,
          thumbnailUrl: categoryThumbnails[catName],
          address: `서울 강남구 ${area.name} 인근 ${j + 1}번지`,
          latitude: area.baseLat + latOffset,
          longitude: area.baseLng + lngOffset,
          phone: `02-${String(500 + i).padStart(3, '0')}-${String(1000 + j * 10).padStart(4, '0')}`,
          description: `${area.name} 근처 ${catName} 맛집`,
          priceRange: price,
          businessHours: hoursOptions[(i + j) % hoursOptions.length],
          dataSource: DataSource.MANUAL,
          menus: {
            create: [
              { name: '대표 메뉴', price: price === PriceRange.UNDER_10K ? 8000 : price === PriceRange.BETWEEN_10K_20K ? 13000 : 25000, sortOrder: 1 },
              { name: '인기 메뉴', price: price === PriceRange.UNDER_10K ? 9000 : price === PriceRange.BETWEEN_10K_20K ? 15000 : 30000, sortOrder: 2 },
            ],
          },
        },
      });
      bulkCount++;
    }
  }
  console.log(`대량 테스트 식당 ${bulkCount}건 추가 입력 완료`);
  console.log(`총 식당 ${restaurants.length + bulkCount}건`);

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
