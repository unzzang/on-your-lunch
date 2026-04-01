/**
 * 온유어런치 — 콜드스타트 식당 데이터 수집 스크립트
 *
 * 카카오 로컬 API를 사용하여 강남역/역삼역/선릉역 반경 1km 식당 데이터를 수집한다.
 *
 * 실행 방법:
 *   KAKAO_REST_API_KEY=your_key npx ts-node scripts/collect-restaurants.ts
 *
 * 환경변수:
 *   KAKAO_REST_API_KEY — 카카오 REST API 키 (필수)
 *   DATABASE_URL — PostgreSQL 연결 문자열 (.env에서 자동 로드)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// 설정
// ─────────────────────────────────────────

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
if (!KAKAO_REST_API_KEY) {
  console.error('KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const KAKAO_API_BASE = 'https://dapi.kakao.com/v2/local/search/keyword.json';

/** 수집 대상 지역 (강남 오피스 밀집 지역) */
const TARGET_LOCATIONS = [
  { name: '강남역', latitude: 37.498095, longitude: 127.027610 },
  { name: '역삼역', latitude: 37.500622, longitude: 127.036456 },
  { name: '선릉역', latitude: 37.504503, longitude: 127.049008 },
];

/** 검색 반경 (미터) */
const SEARCH_RADIUS = 1000;

/** 검색 키워드 목록 */
const SEARCH_KEYWORDS = [
  '맛집',
  '식당',
  '점심',
  '한식',
  '중식',
  '일식',
  '양식',
  '아시안',
  '분식',
  '샐러드',
];

/** 카카오 카테고리 → 자체 카테고리 매핑 */
const CATEGORY_MAPPING: Record<string, string> = {
  // 한식
  '음식점 > 한식': '한식',
  '음식점 > 한식 > 육류,고기': '한식',
  '음식점 > 한식 > 해물,생선': '한식',
  '음식점 > 한식 > 국밥': '한식',
  '음식점 > 한식 > 찌개,전골': '한식',
  '음식점 > 한식 > 칼국수,만두': '한식',
  '음식점 > 한식 > 냉면': '한식',
  '음식점 > 한식 > 족발,보쌈': '한식',
  '음식점 > 한식 > 백반,가정식': '한식',
  '음식점 > 한식 > 죽': '한식',
  '음식점 > 한식 > 쌈밥': '한식',
  '음식점 > 한식 > 비빔밥': '한식',

  // 중식
  '음식점 > 중식': '중식',
  '음식점 > 중식 > 중국요리': '중식',

  // 일식
  '음식점 > 일식': '일식',
  '음식점 > 일식 > 초밥,롤': '일식',
  '음식점 > 일식 > 돈까스': '일식',
  '음식점 > 일식 > 라멘': '일식',
  '음식점 > 일식 > 우동,소바': '일식',

  // 양식
  '음식점 > 양식': '양식',
  '음식점 > 양식 > 이탈리안': '양식',
  '음식점 > 양식 > 프랑스음식': '양식',
  '음식점 > 양식 > 스테이크,립': '양식',
  '음식점 > 양식 > 피자': '양식',
  '음식점 > 양식 > 햄버거': '양식',
  '음식점 > 양식 > 멕시칸,브라질': '양식',

  // 아시안
  '음식점 > 동남아시아음식': '아시안',
  '음식점 > 베트남음식': '아시안',
  '음식점 > 태국음식': '아시안',
  '음식점 > 인도음식': '아시안',
  '음식점 > 아시아음식': '아시안',

  // 분식/간편식
  '음식점 > 분식': '분식/간편식',
  '음식점 > 패스트푸드': '분식/간편식',
  '음식점 > 도시락': '분식/간편식',
  '음식점 > 김밥': '분식/간편식',

  // 샐러드/건강식
  '음식점 > 샐러드': '샐러드/건강식',
  '음식점 > 채식': '샐러드/건강식',
};

// ─────────────────────────────────────────
// 카카오 API 호출
// ─────────────────────────────────────────

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  place_url: string;
}

interface KakaoResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

async function searchKakaoPlaces(
  keyword: string,
  latitude: number,
  longitude: number,
  page: number = 1,
): Promise<KakaoResponse> {
  const params = new URLSearchParams({
    query: keyword,
    x: longitude.toString(),
    y: latitude.toString(),
    radius: SEARCH_RADIUS.toString(),
    category_group_code: 'FD6', // 음식점
    page: page.toString(),
    size: '15',
  });

  const response = await fetch(`${KAKAO_API_BASE}?${params}`, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `카카오 API 오류: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<KakaoResponse>;
}

// ─────────────────────────────────────────
// 카테고리 매핑
// ─────────────────────────────────────────

function mapCategory(kakaoCategoryName: string): string | null {
  // 정확한 매칭 우선
  if (CATEGORY_MAPPING[kakaoCategoryName]) {
    return CATEGORY_MAPPING[kakaoCategoryName];
  }

  // 상위 카테고리로 점진 매칭
  const parts = kakaoCategoryName.split(' > ');
  for (let i = parts.length; i >= 2; i--) {
    const partial = parts.slice(0, i).join(' > ');
    if (CATEGORY_MAPPING[partial]) {
      return CATEGORY_MAPPING[partial];
    }
  }

  // "음식점" 카테고리 그룹이지만 매핑 불가한 경우
  if (kakaoCategoryName.startsWith('음식점')) {
    return '한식'; // 기본값
  }

  return null;
}

// ─────────────────────────────────────────
// 데이터 수집 및 DB 저장
// ─────────────────────────────────────────

async function collectRestaurants() {
  console.log('===================================');
  console.log('온유어런치 — 콜드스타트 데이터 수집');
  console.log('===================================\n');

  // 카테고리 매핑 조회 (DB의 Category 테이블)
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  if (categories.length === 0) {
    console.error(
      '카테고리 시드 데이터가 없습니다. 먼저 pnpm db:seed 를 실행하세요.',
    );
    process.exit(1);
  }
  console.log(`카테고리 ${categories.length}건 로드 완료\n`);

  // 중복 제거를 위한 Set (kakao_place_id 기준)
  const seenPlaceIds = new Set<string>();
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalUnmapped = 0;

  for (const location of TARGET_LOCATIONS) {
    console.log(
      `\n── ${location.name} (${location.latitude}, ${location.longitude}) ──`,
    );

    for (const keyword of SEARCH_KEYWORDS) {
      let page = 1;
      let isEnd = false;

      while (!isEnd && page <= 3) {
        // 카카오 API 페이지 최대 45건
        try {
          const result = await searchKakaoPlaces(
            keyword,
            location.latitude,
            location.longitude,
            page,
          );

          for (const place of result.documents) {
            // 중복 제거
            if (seenPlaceIds.has(place.id)) {
              totalSkipped++;
              continue;
            }
            seenPlaceIds.add(place.id);

            // 카테고리 매핑
            const categoryName = mapCategory(place.category_name);
            if (!categoryName) {
              totalUnmapped++;
              continue;
            }

            const categoryId = categoryMap.get(categoryName);
            if (!categoryId) {
              totalUnmapped++;
              continue;
            }

            // DB에 식당이 이미 존재하는지 확인 (kakao_place_id 기준)
            const existing = await prisma.restaurant.findUnique({
              where: { kakaoPlaceId: place.id },
            });

            if (existing) {
              totalSkipped++;
              continue;
            }

            // DB 삽입
            await prisma.restaurant.create({
              data: {
                kakaoPlaceId: place.id,
                name: place.place_name,
                categoryId: categoryId,
                address: place.road_address_name || place.address_name,
                latitude: parseFloat(place.y),
                longitude: parseFloat(place.x),
                phone: place.phone || null,
                dataSource: 'KAKAO',
              },
            });

            // 카카오 카테고리 매핑 기록 (중복 무시)
            await prisma.kakaoCategoryMapping
              .upsert({
                where: { kakaoCategory: place.category_name },
                update: {},
                create: {
                  kakaoCategory: place.category_name,
                  categoryId: categoryId,
                },
              })
              .catch(() => {
                // 이미 존재하는 매핑은 무시
              });

            totalInserted++;
          }

          isEnd = result.meta.is_end;
          page++;

          // API 속도 제한 대응 (초당 10회)
          await sleep(120);
        } catch (error) {
          console.error(
            `  오류 [${keyword} p${page}]:`,
            (error as Error).message,
          );
          break;
        }
      }
    }

    console.log(`  ${location.name} 수집 완료`);
  }

  console.log('\n===================================');
  console.log('수집 결과');
  console.log('===================================');
  console.log(`신규 삽입: ${totalInserted}건`);
  console.log(`중복 건너뜀: ${totalSkipped}건`);
  console.log(`카테고리 매핑 실패: ${totalUnmapped}건`);
  console.log(`총 고유 장소: ${seenPlaceIds.size}건`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────
// 실행
// ─────────────────────────────────────────

collectRestaurants()
  .then(() => {
    console.log('\n수집 완료.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('수집 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
