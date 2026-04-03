/**
 * ─────────────────────────────────────────
 * 온유어런치 콜드스타트 식당 데이터 수집 스크립트
 *
 * 카카오 로컬 API를 사용하여 강남역/역삼역/선릉역 반경 1km
 * 식당 데이터를 수집하고 DB에 저장한다.
 *
 * 실행:
 *   KAKAO_REST_API_KEY=xxx npx tsx scripts/collect-restaurants.ts
 *
 * 참고:
 *   - 카카오 키워드 검색 API: https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
 *   - 카테고리 FD6 = 음식점
 *   - 한 번 요청에 최대 15건, 페이지 최대 45건(3페이지)
 * ─────────────────────────────────────────
 */

import { PrismaClient, DataSource } from '../../generated/prisma';

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// 설정
// ─────────────────────────────────────────

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY;
if (!KAKAO_API_KEY) {
  console.error('KAKAO_REST_API_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const KAKAO_SEARCH_URL =
  'https://dapi.kakao.com/v2/local/search/keyword.json';

/** 검색 거점 — 강남역, 역삼역, 선릉역 */
const SEARCH_POINTS = [
  { name: '강남역', lat: 37.498095, lng: 127.027610 },
  { name: '역삼역', lat: 37.500622, lng: 127.036456 },
  { name: '선릉역', lat: 37.504503, lng: 127.049008 },
] as const;

/** 검색 반경 (미터) */
const SEARCH_RADIUS = 1000;

/** 검색 키워드 — 다양한 카테고리를 커버하기 위해 여러 키워드로 검색 */
const SEARCH_KEYWORDS = [
  '맛집',
  '점심',
  '식당',
  '밥집',
  '한식',
  '중식',
  '일식',
  '양식',
  '분식',
] as const;

// ─────────────────────────────────────────
// 카카오 카테고리 → 자체 7개 카테고리 매핑
// ─────────────────────────────────────────

/**
 * 카카오 category_name에서 두 번째 뎁스를 추출하여 자체 카테고리로 매핑.
 * 예: "음식점 > 한식 > 백반" → "한식"
 *
 * 자체 7개 카테고리: 한식, 중식, 일식, 양식, 아시안, 분식, 기타
 */
function mapKakaoCategory(kakaoCategoryName: string): string {
  const parts = kakaoCategoryName.split(' > ');
  const subCategory = parts[1]?.trim() ?? '';

  const mapping: Record<string, string> = {
    한식: '한식',
    중식: '중식',
    일식: '일식',
    양식: '양식',
    동남아음식: '아시안',
    인도음식: '아시안',
    아시아음식: '아시안',
    태국음식: '아시안',
    베트남음식: '아시안',
    분식: '분식',
    패스트푸드: '기타',
    치킨: '기타',
    피자: '양식',
    카페: '기타',
    술집: '기타',
    뷔페: '기타',
  };

  return mapping[subCategory] ?? '기타';
}

// ─────────────────────────────────────────
// 카카오 API 타입
// ─────────────────────────────────────────

interface KakaoPlace {
  id: string; // 카카오 place_id
  place_name: string;
  category_name: string; // "음식점 > 한식 > 백반"
  category_group_code: string; // "FD6"
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  place_url: string;
}

interface KakaoSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoPlace[];
}

// ─────────────────────────────────────────
// 카카오 API 호출
// ─────────────────────────────────────────

async function searchKakao(
  keyword: string,
  lat: number,
  lng: number,
  page: number,
): Promise<KakaoSearchResponse> {
  const params = new URLSearchParams({
    query: keyword,
    category_group_code: 'FD6', // 음식점
    x: String(lng),
    y: String(lat),
    radius: String(SEARCH_RADIUS),
    size: '15', // 최대
    page: String(page),
    sort: 'distance',
  });

  const res = await fetch(`${KAKAO_SEARCH_URL}?${params}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`카카오 API 오류: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<KakaoSearchResponse>;
}

// ─────────────────────────────────────────
// 수집 메인 로직
// ─────────────────────────────────────────

interface CollectedRestaurant {
  kakaoPlaceId: string;
  name: string;
  kakaoCategoryName: string;
  mappedCategory: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
}

async function collectAll(): Promise<CollectedRestaurant[]> {
  const allPlaces = new Map<string, CollectedRestaurant>();

  for (const point of SEARCH_POINTS) {
    for (const keyword of SEARCH_KEYWORDS) {
      let page = 1;
      let isEnd = false;

      while (!isEnd && page <= 3) {
        const response = await searchKakao(
          keyword,
          point.lat,
          point.lng,
          page,
        );

        for (const doc of response.documents) {
          // 중복 제거 (kakao place_id 기준)
          if (allPlaces.has(doc.id)) continue;

          // 음식점 카테고리만 수집
          if (doc.category_group_code !== 'FD6') continue;

          allPlaces.set(doc.id, {
            kakaoPlaceId: doc.id,
            name: doc.place_name,
            kakaoCategoryName: doc.category_name,
            mappedCategory: mapKakaoCategory(doc.category_name),
            address: doc.road_address_name || doc.address_name,
            latitude: parseFloat(doc.y),
            longitude: parseFloat(doc.x),
            phone: doc.phone || null,
          });
        }

        isEnd = response.meta.is_end;
        page++;
      }

      // Rate limit 방지 — 요청 간 200ms 대기
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(
      `[${point.name}] 수집 완료 — 누적 ${allPlaces.size}건`,
    );
  }

  return Array.from(allPlaces.values());
}

// ─────────────────────────────────────────
// DB 저장
// ─────────────────────────────────────────

async function saveToDb(restaurants: CollectedRestaurant[]): Promise<void> {
  // 카테고리 목록 조회 (시드 데이터가 먼저 있어야 함)
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  if (categoryMap.size === 0) {
    console.error(
      '카테고리 시드 데이터가 없습니다. 먼저 pnpm db:seed를 실행하세요.',
    );
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;

  for (const r of restaurants) {
    const categoryId = categoryMap.get(r.mappedCategory);
    if (!categoryId) {
      console.warn(
        `카테고리 매핑 실패: "${r.mappedCategory}" (${r.name}) — 건너뜀`,
      );
      skipped++;
      continue;
    }

    try {
      await prisma.restaurant.upsert({
        where: { kakaoPlaceId: r.kakaoPlaceId },
        update: {
          name: r.name,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          phone: r.phone,
          categoryId,
        },
        create: {
          kakaoPlaceId: r.kakaoPlaceId,
          name: r.name,
          categoryId,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          phone: r.phone,
          dataSource: DataSource.KAKAO,
          isUserCreated: false,
          isClosed: false,
        },
      });
      inserted++;
    } catch (err) {
      console.warn(`저장 실패: ${r.name} — ${err}`);
      skipped++;
    }

    // 카카오 카테고리 매핑 테이블에도 기록
    await prisma.kakaoCategoryMapping
      .upsert({
        where: { kakaoCategory: r.kakaoCategoryName },
        update: { categoryId },
        create: {
          kakaoCategory: r.kakaoCategoryName,
          categoryId,
        },
      })
      .catch(() => {
        // 이미 있으면 무시
      });
  }

  console.log(`\nDB 저장 완료: ${inserted}건 저장, ${skipped}건 건너뜀`);
}

// ─────────────────────────────────────────
// 실행
// ─────────────────────────────────────────

async function main() {
  console.log('=== 온유어런치 식당 데이터 수집 시작 ===\n');
  console.log(
    `검색 거점: ${SEARCH_POINTS.map((p) => p.name).join(', ')}`,
  );
  console.log(`검색 반경: ${SEARCH_RADIUS}m`);
  console.log(
    `검색 키워드: ${SEARCH_KEYWORDS.join(', ')}\n`,
  );

  const restaurants = await collectAll();
  console.log(`\n총 수집: ${restaurants.length}건 (중복 제거 후)`);

  // 카테고리별 통계
  const stats = new Map<string, number>();
  for (const r of restaurants) {
    stats.set(r.mappedCategory, (stats.get(r.mappedCategory) ?? 0) + 1);
  }
  console.log('\n카테고리별 분포:');
  for (const [cat, count] of [...stats.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`  ${cat}: ${count}건`);
  }

  console.log('\nDB 저장 중...');
  await saveToDb(restaurants);

  await prisma.$disconnect();
  console.log('\n=== 수집 완료 ===');
}

main().catch((err) => {
  console.error('수집 실패:', err);
  prisma.$disconnect();
  process.exit(1);
});
