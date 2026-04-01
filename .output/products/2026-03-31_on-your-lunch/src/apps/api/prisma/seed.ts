import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('시드 데이터 입력 시작...');

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
      update: { colorCode: cat.colorCode, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log(`카테고리 ${categories.length}건 입력 완료`);

  // 알레르기 6건
  const allergyTypes = [
    { name: '갑각류', sortOrder: 1 },
    { name: '견과류', sortOrder: 2 },
    { name: '유제품', sortOrder: 3 },
    { name: '밀', sortOrder: 4 },
    { name: '달걀', sortOrder: 5 },
    { name: '대두', sortOrder: 6 },
  ];

  for (const allergy of allergyTypes) {
    await prisma.allergyType.upsert({
      where: { name: allergy.name },
      update: { sortOrder: allergy.sortOrder },
      create: allergy,
    });
  }
  console.log(`알레르기 ${allergyTypes.length}건 입력 완료`);

  // 카카오 카테고리 매핑 데이터
  // 카카오 로컬 API 카테고리 → 자체 7개 카테고리 매핑
  const kakaoCategoryMappings = [
    // 한식
    { kakaoCategory: '음식점 > 한식', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 육류,고기', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 해물,생선', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 국밥', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 찌개,전골', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 칼국수,만두', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 냉면', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 족발,보쌈', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 백반,가정식', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 죽', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 쌈밥', categoryName: '한식' },
    { kakaoCategory: '음식점 > 한식 > 비빔밥', categoryName: '한식' },
    // 중식
    { kakaoCategory: '음식점 > 중식', categoryName: '중식' },
    { kakaoCategory: '음식점 > 중식 > 중국요리', categoryName: '중식' },
    // 일식
    { kakaoCategory: '음식점 > 일식', categoryName: '일식' },
    { kakaoCategory: '음식점 > 일식 > 초밥,롤', categoryName: '일식' },
    { kakaoCategory: '음식점 > 일식 > 돈까스', categoryName: '일식' },
    { kakaoCategory: '음식점 > 일식 > 라멘', categoryName: '일식' },
    { kakaoCategory: '음식점 > 일식 > 우동,소바', categoryName: '일식' },
    // 양식
    { kakaoCategory: '음식점 > 양식', categoryName: '양식' },
    { kakaoCategory: '음식점 > 양식 > 이탈리안', categoryName: '양식' },
    { kakaoCategory: '음식점 > 양식 > 프랑스음식', categoryName: '양식' },
    { kakaoCategory: '음식점 > 양식 > 스테이크,립', categoryName: '양식' },
    { kakaoCategory: '음식점 > 양식 > 피자', categoryName: '양식' },
    { kakaoCategory: '음식점 > 양식 > 햄버거', categoryName: '양식' },
    { kakaoCategory: '음식점 > 양식 > 멕시칸,브라질', categoryName: '양식' },
    // 아시안
    { kakaoCategory: '음식점 > 동남아시아음식', categoryName: '아시안' },
    { kakaoCategory: '음식점 > 베트남음식', categoryName: '아시안' },
    { kakaoCategory: '음식점 > 태국음식', categoryName: '아시안' },
    { kakaoCategory: '음식점 > 인도음식', categoryName: '아시안' },
    { kakaoCategory: '음식점 > 아시아음식', categoryName: '아시안' },
    // 분식/간편식
    { kakaoCategory: '음식점 > 분식', categoryName: '분식/간편식' },
    { kakaoCategory: '음식점 > 패스트푸드', categoryName: '분식/간편식' },
    { kakaoCategory: '음식점 > 도시락', categoryName: '분식/간편식' },
    { kakaoCategory: '음식점 > 김밥', categoryName: '분식/간편식' },
    // 샐러드/건강식
    { kakaoCategory: '음식점 > 샐러드', categoryName: '샐러드/건강식' },
    { kakaoCategory: '음식점 > 채식', categoryName: '샐러드/건강식' },
  ];

  // 카테고리 ID 조회
  const allCategories = await prisma.category.findMany();
  const categoryIdMap = new Map(allCategories.map((c) => [c.name, c.id]));

  let mappingCount = 0;
  for (const mapping of kakaoCategoryMappings) {
    const categoryId = categoryIdMap.get(mapping.categoryName);
    if (!categoryId) {
      console.warn(`카테고리 '${mapping.categoryName}'을 찾을 수 없습니다.`);
      continue;
    }
    await prisma.kakaoCategoryMapping.upsert({
      where: { kakaoCategory: mapping.kakaoCategory },
      update: { categoryId },
      create: {
        kakaoCategory: mapping.kakaoCategory,
        categoryId,
      },
    });
    mappingCount++;
  }
  console.log(`카카오 카테고리 매핑 ${mappingCount}건 입력 완료`);

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
