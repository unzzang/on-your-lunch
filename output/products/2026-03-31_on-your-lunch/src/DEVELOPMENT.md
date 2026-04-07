# 온유어런치 개발 가이드 (v2 — 웹 기반)

이 문서는 온유어런치를 **Next.js + PWA** 기반 웹앱으로 개발하는 전체 계획서입니다.
코드를 작성하기 전에 이 계획서를 PO에게 공유하고 승인을 받습니다.

---

## 아키텍처 변경 이력

| 버전 | 기술 | 상태 | 사유 |
|------|------|------|------|
| v1 | Expo + React Native | backup/ 보관 | 지도 SDK 호환 문제, 디자인 대조 비효율, 배포 속도 |
| **v2** | **Next.js + PWA** | **현재 진행** | PO 결정 (2026-04-05 미팅노트 참조) |

---

## 기술 스택

| 영역 | 기술 | 선정 근거 |
|------|------|----------|
| **프론트** | Next.js 15 (App Router) | 토스 방식 웹앱, SSR/SSG 지원, 즉시 배포 |
| **스타일** | Tailwind CSS 4 | 디자인 HTML의 CSS와 1:1 대응 가능 |
| **상태 관리** | Zustand 5 | 이전 버전과 동일, 학습 비용 0 |
| **API 통신** | TanStack Query v5 + ky | 이전 버전과 동일 |
| **지도** | 카카오맵 JS SDK | WebView 없이 직접 사용 (JS 키: 1144f9ac...) |
| **인증** | Google OAuth (next-auth) | 웹 환경에 최적화 |
| **PWA** | next-pwa | 홈 화면 추가, 오프라인 지원 |
| **백엔드** | NestJS 11 + Prisma 6 + PostgreSQL 16 | 변경 없음 (백엔드팀 담당) |
| **공유 타입** | @on-your-lunch/shared-types | 변경 없음 |
| **빌드** | pnpm workspace + Turborepo | 변경 없음 |
| **배포** | Vercel (프론트) + Railway (백엔드) | 즉시 배포 |

---

## 프로젝트 구조

```
src/
├── apps/
│   ├── api/                    ← 백엔드 (NestJS) — 백엔드팀 담당, 프론트에서 수정 금지
│   │   ├── prisma/               스키마 + 시드 + 마이그레이션
│   │   └── src/                  API 소스코드
│   └── web/                    ← 프론트엔드 (Next.js) — 이번에 새로 생성
│       ├── app/                  App Router (페이지)
│       │   ├── layout.tsx          루트 레이아웃 (QueryClient, 글로벌 스타일)
│       │   ├── page.tsx            랜딩 → 로그인으로 리다이렉트
│       │   ├── (auth)/             인증 그룹
│       │   │   ├── login/            로그인 (Google OAuth)
│       │   │   └── terms/            약관 동의
│       │   ├── (onboarding)/       온보딩 그룹
│       │   │   ├── location/         Step 1: 회사 위치
│       │   │   ├── preference/       Step 2: 취향 설정
│       │   │   └── exclusion/        Step 3: 제외 설정
│       │   └── (main)/             메인 그룹 (하단 탭)
│       │       ├── layout.tsx        탭 레이아웃 (BottomNav 포함)
│       │       ├── home/             홈 (오늘의 추천)
│       │       ├── explore/          탐색 (지도 + 리스트)
│       │       ├── history/          먹은 이력 (캘린더)
│       │       ├── mypage/           마이페이지
│       │       └── restaurant/[id]/  식당 상세 (탭바 없음)
│       ├── components/           공유 컴포넌트
│       │   ├── ui/                 기본 UI (Button, Card, Chip, Input...)
│       │   ├── layout/             레이아웃 (BottomNav, AppBar...)
│       │   └── features/           기능 컴포넌트 (RestaurantCard, Calendar...)
│       ├── hooks/                커스텀 훅
│       │   ├── useRecommendations.ts
│       │   ├── useRestaurants.ts
│       │   ├── useEatingHistory.ts
│       │   └── ...
│       ├── lib/                  유틸리티
│       │   ├── api.ts              API 클라이언트 (ky)
│       │   ├── auth.ts             인증 헬퍼
│       │   └── kakao-map.ts        카카오맵 초기화
│       ├── stores/               Zustand 스토어
│       │   ├── authStore.ts
│       │   ├── filterStore.ts
│       │   └── onboardingStore.ts
│       ├── styles/               스타일
│       │   └── tokens.ts           디자인 토큰 (Tailwind과 병행)
│       ├── public/               정적 파일
│       │   ├── manifest.json       PWA 매니페스트
│       │   └── icons/              앱 아이콘
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
└── packages/
    └── shared-types/           ← 공유 타입 (변경 없음)
```

### 디자인 HTML과의 대응

| 디자인 HTML | Next.js 페이지 | 비고 |
|------------|---------------|------|
| `design/home.html` | `app/(main)/home/page.tsx` | 디자인 CSS를 Tailwind로 1:1 변환 |
| `design/explore.html` | `app/(main)/explore/page.tsx` | 카카오맵 JS SDK 직접 사용 |
| `design/eating-history.html` | `app/(main)/history/page.tsx` | |
| `design/mypage.html` | `app/(main)/mypage/page.tsx` | |
| `design/restaurant-detail.html` | `app/(main)/restaurant/[id]/page.tsx` | 탭바 숨김 |
| `design/onboarding.html` | `app/(onboarding)/*/page.tsx` | 3단계 분리 |

---

## 개발 원칙 (절대 규칙)

### 1. 순서 엄수

```
DB(Prisma) 먼저 → shared-types → 백엔드 → 프론트
```

이 순서를 건너뛰지 않는다. DB 스키마가 없으면 타입을 못 만들고, 타입이 없으면 API를 못 만들고, API가 없으면 화면을 못 만든다.

### 2. 한 번에 하나씩

- 파일 하나 생성 → 동작 확인 → 다음 파일
- **화면 여러 개를 한꺼번에 만들면 에러가 동시에 폭발한다** (v1 교훈)
- 브라우저에서 확인 후 다음 화면으로 진행

### 3. 각 Phase 완료 후 PO 확인

- 코드만 짜고 넘어가지 않는다
- **실제 동작하는 화면을 PO에게 보여주고 승인** 후 다음 Phase 진행

### 4. 영역 침범 금지

- 프론트 작업 시 `apps/api/` 폴더 수정 금지
- 백엔드 작업이 필요하면 **즉시 멈추고 PO에게 보고**
- shared-types 수정도 백엔드팀과 합의 후 진행

### 5. node_modules 규칙

- **`src/` 루트에만 node_modules 설치** (pnpm workspace)
- 하위 패키지(`apps/web/`, `apps/api/`)에 개별 node_modules 생성 금지
- 의존성 추가: `pnpm add {패키지} --filter {워크스페이스명}`

### 6. 디자인 대조는 브라우저 측정 필수

- 코드 수치만 읽고 "일치"라 판단하면 안 됨
- **browse 스킬로 디자인 HTML을 열고 inspect로 computed CSS 측정**
- font-size, font-weight, line-height, margin(음수 포함), padding, background-color 전부 측정
- 디자인에 이미지가 있으면 코드에도 반드시 포함 (placeholder 아이콘 금지)

---

## Phase별 개발 계획

### 역할 분담

| 영역 | 담당 | 규칙 |
|------|------|------|
| Phase 1~2 (공통 셋업) | 백엔드팀 + 프론트팀 협업 | shared-types 합의 후 각자 진행 |
| Phase 3~4 (백엔드) | **백엔드팀** (이인수, 이명환) | 프론트에서 `apps/api/` 수정 금지 |
| Phase 5~14 (프론트) | **프론트팀** (잭도슨) | 백엔드 API를 호출만 함 |

### Phase 1. 프로젝트 뼈대 (환경 셋업)

**목표:** 모노레포 구조가 완성되고, Next.js 앱이 `http://localhost:3001`에서 실행되는 상태

**1-1. 루트 설정 파일 (src/ 하위)**

```
src/
├── package.json              ← 프로젝트 신분증 + 스크립트 정의
├── pnpm-workspace.yaml       ← 워크스페이스 멤버 선언 (apps/*, packages/*)
├── turbo.json                ← 빌드 순서 + 캐시 설정
├── tsconfig.json             ← 루트 TypeScript 설정
├── .npmrc                    ← shamefully-hoist=true (패키지 호이스팅)
├── .gitignore                ← node_modules, dist, .env 등
├── .prettierrc               ← 코드 스타일
└── .env                      ← 환경변수 (DB, JWT, 카카오 키)
```

**루트 package.json 스크립트:**
```json
{
  "scripts": {
    "api:dev": "turbo run dev --filter=@on-your-lunch/api",
    "api:build": "turbo run build --filter=@on-your-lunch/api",
    "web:dev": "turbo run dev --filter=@on-your-lunch/web",
    "web:build": "turbo run build --filter=@on-your-lunch/web",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:migrate": "pnpm --filter @on-your-lunch/api exec prisma migrate dev",
    "db:seed": "pnpm --filter @on-your-lunch/api exec prisma db seed",
    "db:studio": "pnpm --filter @on-your-lunch/api exec prisma studio"
  }
}
```

**주의사항:**
- `packageManager` 필드 필수 (turbo가 요구)
- turbo는 루트에 devDependency로 설치
- node_modules는 `src/`에만 생성 (하위 폴더 금지)

**1-2. Next.js 앱 셋업 (apps/web/)**

```
apps/web/
├── package.json              ← Next.js + Tailwind + 의존성
├── next.config.js            ← API 프록시 (localhost:3000 → /api), PWA 설정
├── tailwind.config.js        ← 디자인 토큰 기반 커스텀 테마
├── postcss.config.js         ← Tailwind PostCSS 설정
├── tsconfig.json             ← 경로 별칭 (@/)
├── app/
│   ├── layout.tsx            ← 루트 레이아웃 (QueryClient, 글로벌 스타일)
│   ├── page.tsx              ← 랜딩 페이지
│   └── globals.css           ← Tailwind + 디자인 토큰 CSS 변수 (:root)
└── public/
    ├── manifest.json         ← PWA 매니페스트
    └── icons/                ← 앱 아이콘 (192x192, 512x512)
```

**확인 기준:**
- [ ] `pnpm install` → `src/node_modules/` 생성 (유일한 패키지 저장소)
- [ ] `pnpm web:dev`로 로컬 서버 실행
- [ ] 브라우저에서 `http://localhost:3001` 접속 확인
- [ ] Tailwind CSS 적용 확인
- [ ] 디자인 토큰(CSS 변수)이 `:root`에 반영
- [ ] **PO 확인:** 브라우저에서 페이지가 뜨는지 직접 확인

### Phase 2. shared-types 정의 (프론트↔백엔드 합의)

**목표:** 백엔드와 프론트가 주고받을 데이터의 모양을 합의한다.
**담당:** 백엔드팀 + 프론트팀 공동

**생성할 파일:**
```
packages/shared-types/src/
├── index.ts                  ← 전체 export
├── common.ts                 ← ApiResponse, CategorySummary, MyVisitSummary
├── enums.ts                  ← PriceRange
├── constants.ts              ← MEMO_MAX_LENGTH, WalkMinutes
├── auth.ts                   ← GoogleLoginRequest/Response, TokenResponse
├── user.ts                   ← UserProfile, OnboardingRequest
├── restaurant.ts             ← RestaurantDetail, RestaurantListItem, RestaurantMapPin
├── recommendation.ts         ← RecommendationItem, TodayResponse
├── eating-history.ts         ← CreateEatingHistory, CalendarDay
├── favorite.ts               ← FavoriteToggle
└── notification.ts           ← NotificationSettings
```

**핵심:** backup의 `packages/shared-types/`를 그대로 복사하여 사용. 웹 전환으로 타입이 바뀌는 부분 없음.

**확인 기준:**
- [ ] `pnpm build --filter shared-types` 빌드 성공
- [ ] 백엔드와 프론트 양쪽에서 import 가능

### Phase 3. 백엔드 구축 (백엔드팀 담당)

**목표:** NestJS API 서버가 `http://localhost:3000`에서 실행되고, 모든 API 엔드포인트가 동작하는 상태
**담당:** 백엔드팀 (이인수, 이명환). **프론트에서 수정 금지.**

**생성할 파일:**
```
apps/api/
├── prisma/
│   ├── schema.prisma           ← 14개 테이블 (backup에서 복사)
│   ├── seed.ts                 ← 시드 데이터 (카테고리 7건, 알레르기 6건)
│   └── seed-restaurants.ts     ← 테스트 식당 데이터
├── src/
│   ├── main.ts                 ← 앱 진입점 (globalPrefix: v1, CORS, Swagger)
│   ├── app.module.ts           ← 전체 모듈 등록
│   ├── app.controller.ts       ← 헬스체크
│   ├── prisma/                 ← Prisma 서비스 (NestJS + Prisma 7 패턴)
│   ├── auth/                   ← Google OAuth + JWT + dev-login
│   ├── user/                   ← 프로필, 위치, 취향
│   ├── category/               ← 카테고리 + 알레르기 마스터 데이터
│   ├── restaurant/             ← CRUD, 검색, 지도 핀
│   ├── recommendation/         ← 추천 알고리즘
│   ├── eating-history/         ← 먹은 이력 + 캘린더
│   ├── favorite/               ← 즐겨찾기
│   ├── share/                  ← 딥링크
│   ├── notification/           ← 푸시 알림
│   ├── event/                  ← 이벤트 로그
│   └── common/                 ← 데코레이터, 필터, 인터셉터
├── package.json
├── tsconfig.json
└── nest-cli.json
```

**백엔드 API 목록 (11개 모듈):**

| 모듈 | 주요 엔드포인트 | 비고 |
|------|---------------|------|
| auth | `POST /v1/auth/google`, `POST /v1/auth/dev-login`, `POST /v1/auth/refresh` | dev-login은 개발용 |
| user | `GET /v1/users/me`, `PUT /v1/users/me`, `POST /v1/users/onboarding` | |
| category | `GET /v1/categories`, `GET /v1/categories/allergies` | 마스터 데이터 |
| restaurant | `GET /v1/restaurants`, `GET /v1/restaurants/:id`, `GET /v1/restaurants/map` | 지도 핀 포함 |
| recommendation | `GET /v1/recommendations/today`, `POST /v1/recommendations/refresh` | |
| eating-history | `GET /v1/eating-history/calendar`, `POST /v1/eating-history` | |
| favorite | `POST /v1/favorites/:restaurantId`, `DELETE /v1/favorites/:restaurantId` | |
| share | `GET /v1/share/:restaurantId` | 딥링크 |
| notification | `GET /v1/notifications/settings`, `PUT /v1/notifications/settings` | |
| event | `POST /v1/events` | 이벤트 로그 |

**백엔드 API 전체 엔드포인트 (26개):**

| # | 메서드 | 경로 | 설명 | 인증 |
|---|--------|------|------|------|
| 1 | POST | `/v1/auth/google` | Google OAuth 로그인 | 불필요 |
| 2 | POST | `/v1/auth/dev-login` | 개발용 자동 로그인 | 불필요 |
| 3 | POST | `/v1/auth/refresh` | 토큰 갱신 | Refresh 토큰 |
| 4 | GET | `/v1/users/me` | 내 프로필 조회 | JWT |
| 5 | PUT | `/v1/users/me` | 프로필 수정 (닉네임) | JWT |
| 6 | PUT | `/v1/users/me/location` | 회사 위치 수정 | JWT |
| 7 | PUT | `/v1/users/me/preferences` | 취향 수정 | JWT |
| 8 | POST | `/v1/users/onboarding` | 온보딩 완료 (위치+취향+제외 한번에) | JWT |
| 9 | DELETE | `/v1/users/me` | 회원 탈퇴 | JWT |
| 10 | GET | `/v1/categories` | 카테고리 목록 (7건) | 불필요 |
| 11 | GET | `/v1/categories/allergies` | 알레르기 목록 (6건) | 불필요 |
| 12 | GET | `/v1/restaurants` | 식당 리스트 (필터/정렬/페이징) | JWT |
| 13 | GET | `/v1/restaurants/:id` | 식당 상세 | JWT |
| 14 | GET | `/v1/restaurants/map` | 지도 핀 목록 (좌표 범위) | JWT |
| 15 | GET | `/v1/recommendations/today` | 오늘의 추천 3곳 | JWT |
| 16 | POST | `/v1/recommendations/refresh` | 추천 새로고침 | JWT |
| 17 | GET | `/v1/eating-history/calendar` | 월별 먹은 이력 (캘린더) | JWT |
| 18 | POST | `/v1/eating-history` | 먹은 기록 저장 | JWT |
| 19 | PUT | `/v1/eating-history/:id` | 기록 수정 | JWT |
| 20 | DELETE | `/v1/eating-history/:id` | 기록 삭제 | JWT |
| 21 | POST | `/v1/favorites/:restaurantId` | 즐겨찾기 추가 | JWT |
| 22 | DELETE | `/v1/favorites/:restaurantId` | 즐겨찾기 해제 | JWT |
| 23 | GET | `/v1/share/:restaurantId` | 공유 딥링크 | JWT |
| 24 | GET | `/v1/notifications/settings` | 알림 설정 조회 | JWT |
| 25 | PUT | `/v1/notifications/settings` | 알림 설정 변경 | JWT |
| 26 | POST | `/v1/events` | 이벤트 로그 | JWT |

**Prisma 7 주의사항 (v1 교훈 — 반드시 숙지):**

1. **generator 설정:** `prisma-client-js` 사용. `prisma-client`(ESM)는 NestJS(CJS)와 충돌.
2. **어댑터 필수:** `@prisma/adapter-pg` 전달. `new PrismaClient()` 만으로는 안 됨.
3. **NestJS PrismaService 패턴:**
   ```typescript
   import { PrismaClient } from '@prisma/client';
   import { PrismaPg } from '@prisma/adapter-pg';
   
   @Injectable()
   export class PrismaService extends PrismaClient {
     constructor() {
       const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
       super({ adapter } as any);
     }
   }
   ```
4. **seed 설정:** `prisma.config.ts` 안에 작성 (package.json의 prisma.seed가 아님)
5. **필요 패키지:** `@prisma/client`, `@prisma/adapter-pg`, `prisma`, `dotenv`, `tsx`

**NestJS 주요 패턴:**
- 전역 JWT Guard + `@Public()` 데코레이터: 인증 불필요한 엔드포인트에 `@Public()` 적용
- `ResponseInterceptor`: 모든 응답을 `{ success: true, data: {...} }` 형태로 자동 래핑
- `GlobalExceptionFilter`: 에러를 `{ success: false, error: { code, message } }` 형태로 변환

**확인 기준:**
- [ ] `pnpm api:dev`로 서버 시작
- [ ] `curl http://localhost:3000/health` → `{"status":"ok"}`
- [ ] `curl http://localhost:3000/v1/categories` → 카테고리 7건
- [ ] `curl -X POST http://localhost:3000/v1/auth/dev-login` → 토큰 발급
- [ ] Swagger (`http://localhost:3000/v1/docs`) 접속 가능
- [ ] 26개 엔드포인트 전체 등록 확인 (Swagger에서)
- [ ] **PO 확인:** Swagger에서 API 목록 직접 확인

### Phase 4. 백엔드 검증 (백엔드팀 담당)

**목표:** 모든 API가 기능 명세서대로 동작하는지 확인
**담당:** 백엔드팀 + QA팀

**검증 항목:**

1. **정적 검증:**
   - [ ] TypeScript 타입 체크 통과 (에러 0건)
   - [ ] 빌드 성공 (`pnpm api:build`)
   - [ ] 린트 통과 (`pnpm api:lint`)

2. **DB 검증:**
   - [ ] 14개 테이블 생성 확인 (`pnpm db:studio`)
   - [ ] 시드 데이터: 카테고리 7건, 알레르기 6건, 테스트 식당
   - [ ] 마이그레이션 정상 (`pnpm db:migrate`)

3. **API 검증 (26개 엔드포인트):**
   - [ ] dev-login으로 토큰 발급 → 이후 모든 API 호출에 사용
   - [ ] 각 엔드포인트 요청 → `{ success: true, data: {...} }` 응답 확인
   - [ ] shared-types와 실제 응답 필드 1:1 대조
   - [ ] 에러 케이스: 잘못된 요청 → `{ success: false, error: {...} }` 확인

4. **API 훅 대조 (프론트와 합의):**
   - [ ] 백엔드 API 26개 vs 프론트 hooks 목록 1:1 대조
   - [ ] 누락된 엔드포인트 0건

5. **응답 필드 완전성 검증 (기능 명세 기준):**
   - [ ] 각 API 응답에 **기능 명세서에서 요구하는 모든 필드**가 포함되어 있는가
   - [ ] 지도 기능 → 식당 리스트에 `latitude`, `longitude` 포함 여부
   - [ ] 내 기록 → `lastMemo` 포함 여부
   - [ ] `success: true`만 확인하고 넘기지 않는다. **응답 필드를 하나씩 대조한다.**

**확인 기준:**
- [ ] 위 전체 통과
- [ ] **PO 확인:** Swagger에서 핵심 플로우 (로그인→추천조회→기록저장) 직접 테스트

---

### Phase 5. 디자인 시스템 구축 (프론트)

**목표:** 디자인 HTML의 CSS 변수 + 컴포넌트를 Tailwind + React 컴포넌트로 변환

**생성할 파일:**
```
app/globals.css               ← :root에 디자인 토큰 CSS 변수 전체 선언
tailwind.config.js            ← 토큰을 Tailwind theme으로 매핑
components/ui/
├── Button.tsx                ← Primary / Secondary / Text
├── Card.tsx                  ← 식당 카드 (이미지 + 정보)
├── Chip.tsx                  ← 필터 칩 (Active / Inactive)
├── Input.tsx                 ← 텍스트 입력
├── BottomSheet.tsx           ← 바텀시트
├── Toast.tsx                 ← 토스트 알림
├── Skeleton.tsx              ← 로딩 스켈레톤
├── EmptyState.tsx            ← 빈 상태
├── ErrorState.tsx            ← 에러 상태
└── Modal.tsx                 ← 모달/다이얼로그
```

**핵심 원칙:**
- 디자인 HTML의 CSS를 **browse 스킬로 inspect하여 computed 값 측정** 후 구현
- 디자인 토큰을 Tailwind custom theme으로 등록 (임의 값 사용 금지)
- 각 컴포넌트는 4가지 상태 필수: 정상 / 호버 / 활성 / 비활성

**확인 기준:**
- [ ] 각 컴포넌트를 개별 페이지에서 렌더링하여 디자인 HTML과 비교
- [ ] browse 스킬로 computed CSS 측정 후 일치 확인

### Phase 6. API 연동 레이어 (프론트)

**목표:** 백엔드 API와 통신하는 hooks + API 클라이언트 완성

**생성할 파일:**
```
lib/api.ts                    ← ky 기반 API 클라이언트 (baseURL, 토큰 주입)
hooks/
├── useRecommendations.ts     ← GET /v1/recommendations/today
├── useRestaurants.ts         ← GET /v1/restaurants
├── useRestaurant.ts          ← GET /v1/restaurants/:id
├── useCategories.ts          ← GET /v1/categories
├── useAllergyTypes.ts        ← GET /v1/categories/allergies
├── useEatingHistory.ts       ← GET /v1/eating-history/calendar
├── useMe.ts                  ← GET /v1/users/me
└── useMutations.ts           ← POST/PUT/DELETE 훅 모음
stores/
├── authStore.ts              ← 토큰 + 사용자 정보
├── filterStore.ts            ← 홈 필터 상태
└── onboardingStore.ts        ← 온보딩 진행 상태
```

**핵심 원칙:**
- backup의 `services/hooks/` 코드를 참조하되 React Native → React 웹으로 변환
- API 응답은 `{ success: true, data: {...} }` 형태 (backup 교훈 #2)
- 백엔드 코드는 절대 수정하지 않음

**확인 기준:**
- [ ] 백엔드 실행 후 각 hook에서 데이터 fetching 성공
- [ ] 타입 체크 통과 (shared-types와 일치)

### Phase 7~12. 화면 구현 공통 원칙

**모든 화면 구현 Phase에 적용:**

1. **한 화면씩:** 파일 1개 만들고 → 브라우저에서 확인 → 다음 파일. 여러 화면을 한꺼번에 만들지 않는다.
2. **디자인 먼저 측정:** 구현 전에 browse로 디자인 HTML을 열고 해당 화면의 모든 요소 computed CSS 측정.
3. **이미지 포함:** 디자인에 이미지가 있으면 반드시 코드에도 포함 (테스트용 Unsplash라도).
4. **4가지 상태:** 정상 / 로딩(Skeleton) / 빈 상태 / 에러 상태 — 누락 불가.
5. **PO 확인:** 각 화면 완료 후 브라우저에서 PO에게 보여주고 승인.

---

### Phase 7. 화면 구현 — 온보딩 + 인증

**목표:** 스플래시 → 로그인 → 약관 → 온보딩 3단계 플로우 완성

**생성할 파일 (순서대로, 하나씩):**
```
1. app/(auth)/login/page.tsx       ← 먼저 만들고 브라우저 확인
2. app/(auth)/terms/page.tsx       ← 확인 후 다음
3. app/(onboarding)/location/page.tsx
4. app/(onboarding)/preference/page.tsx
5. app/(onboarding)/exclusion/page.tsx
```

**디자인 대조:** `design/onboarding.html`을 browse로 inspect
**PO 확인:** 로그인→약관→온보딩 3단계 플로우를 브라우저에서 직접 클릭하며 확인

### Phase 8. 화면 구현 — 홈

**목표:** 홈 탭 완성 (인사말 + 필터 + 카드 3장 + 새로고침)

**생성할 파일:**
```
app/(main)/layout.tsx           ← 탭 레이아웃 + BottomNav
app/(main)/home/page.tsx
components/features/RestaurantCard.tsx
components/features/FilterChips.tsx
components/layout/BottomNav.tsx
components/layout/AppBar.tsx
```

**디자인 대조:** `design/home.html`을 browse로 inspect
- 페이지 배경: bg-secondary
- 앱바/인사말/필터: bg-primary
- 카드: border 1px + shadow-sm, 이미지 160px, 하트 음수 마진
- 이미지: fallback Unsplash 이미지 필수

### Phase 9. 화면 구현 — 탐색 (지도 + 리스트)

**목표:** 지도뷰/리스트뷰 토글 + 카카오맵 + 식당 핀

**생성할 파일:**
```
app/(main)/explore/page.tsx
components/features/KakaoMap.tsx       ← 카카오맵 JS SDK 직접 사용
components/features/RestaurantList.tsx
components/features/MiniCard.tsx
```

**카카오맵 연동:**
- JS 키: `1144f9ac6655582f8e9cebf17f90ffab`
- `<Script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=...&autoload=false" />`
- Next.js에서 Script 태그로 로드, `kakao.maps.load()` 콜백에서 초기화
- WebView 불필요 — 웹이므로 직접 DOM에 렌더링

**디자인 대조:** `design/explore.html`을 browse로 inspect

### Phase 10. 화면 구현 — 먹은 이력

**목표:** 캘린더 + 날짜별 기록 + 기록 추가

**생성할 파일:**
```
app/(main)/history/page.tsx
components/features/Calendar.tsx
components/features/RecordCard.tsx
```

**디자인 대조:** `design/eating-history.html`

### Phase 11. 화면 구현 — 마이페이지

**목표:** 프로필 + 설정 + 하위 페이지 (프로필 편집, 알림, 탈퇴)

**생성할 파일:**
```
app/(main)/mypage/page.tsx
app/(main)/mypage/edit-profile/page.tsx
app/(main)/mypage/notification/page.tsx
app/(main)/mypage/withdraw/page.tsx
```

**디자인 대조:** `design/mypage.html`

### Phase 12. 화면 구현 — 식당 상세

**목표:** 히어로 이미지 + 정보 + 내 기록 + 지도 + 먹었어요 바텀시트

**생성할 파일:**
```
app/(main)/restaurant/[id]/page.tsx
```

**핵심:**
- 탭바(BottomNav) 숨김
- 히어로 그라데이션: CSS `linear-gradient` 사용 (네이티브와 달리 직접 지원)
- 이미지 dot 인디케이터
- 하단 고정 버튼 (길찾기 + 먹었어요)

**디자인 대조:** `design/restaurant-detail.html`

### Phase 13. API 연동 + 디자인 최종 검수

**목표:** 모든 화면에서 실제 API 데이터 표시 + 디자인 100% 일치

**확인 기준:**
- [ ] MOCK 데이터 0건 (`grep -rn "MOCK_"` 결과 0건)
- [ ] 모든 화면 브라우저 스크린샷 vs 디자인 HTML 비교
- [ ] browse 스킬로 각 화면 computed CSS 측정
- [ ] 4가지 상태(정상/로딩/빈/에러) 전체 구현
- [ ] 이미지가 디자인과 동일하게 표시

### Phase 14. PWA 설정 + QA

**목표:** 모바일에서 "홈 화면에 추가"로 앱처럼 사용 가능 + QA 통과

**14-1. PWA 설정:**
- manifest.json (앱 이름: 온유어런치, 아이콘, 테마 색상: #D4501F)
- Service Worker (오프라인 캐싱)
- 모바일 Safari에서 "홈 화면에 추가" 테스트
- 모바일 Chrome에서 PWA 설치 테스트

**14-2. QA 4단계 (건너뛰기 금지):**

**Phase 1 — 정적 검증:**
- [ ] TypeScript 타입 체크 (에러 0건)
- [ ] 빌드 성공 (`pnpm web:build`)
- [ ] 린트 통과

**Phase 2 — 통합 검증:**
- [ ] 모든 API 엔드포인트 호출 테스트 (success: true 반환)
- [ ] shared-types와 실제 응답 필드 일치
- [ ] CORS 정상 동작

**Phase 3 — 기능 검증 (브라우저에서):**

핵심 플로우 10개:
1. [ ] 로그인 (dev-login) → 홈 진입
2. [ ] 온보딩 3단계 (위치→취향→제외)
3. [ ] 홈 추천 3곳 표시 + 새로고침
4. [ ] 홈 필터 (카테고리, 도보시간, 가격)
5. [ ] 탐색 지도뷰 (카카오맵 + 마커)
6. [ ] 탐색 리스트뷰 ↔ 지도뷰 전환
7. [ ] 식당 상세 → 먹었어요 기록 저장
8. [ ] 먹은 이력 캘린더 + 날짜별 기록
9. [ ] 마이페이지 프로필 편집
10. [ ] 즐겨찾기 토글

**Phase 4 — 수정 재검증:**
- 버그 수정 후 해당 기능만 재검증
- 수정이 다른 기능에 영향 줬는지 확인

**이슈 심각도:**

| 심각도 | 정의 | 예시 |
|--------|------|------|
| **상** | 핵심 기능 불가 | 앱 크래시, 로그인 불가, 추천 표시 안 됨 |
| **중** | 기능 동작하나 불완전 | 스크롤 안 됨, 데이터 불일치, 디자인 불일치 |
| **하** | 개선하면 좋을 수준 | UI 정렬, 폰트 미세 차이 |

**판정 기준:**

| 판정 | 조건 | 다음 단계 |
|------|------|----------|
| **통과** | 상 0건 + 중 0건 | 출시 가능 |
| **조건부 통과** | 상 0건 + 중 3건 이하 | 병행 수정하며 출시 준비 |
| **실패** | 상 1건 이상 또는 중 4건 이상 | 수정 후 재검증 |

---

## 이전 개발(v1)에서 배운 삽질 방지 체크리스트

### 프로세스 교훈

| # | 교훈 | 방지법 |
|---|------|--------|
| 1 | 코드부터 작성 → 방향 틀어짐 | **개발 계획서 먼저 작성 + PO 승인** |
| 2 | 화면 20개 한꺼번에 → 에러 폭발 | **한 화면씩 만들고 브라우저 확인** |
| 3 | 백엔드 코드 직접 수정 → 빌드 파괴 | **apps/api/ 절대 수정 금지. 멈추고 보고** |
| 4 | Phase 완료 확인 없이 다음 진행 | **PO에게 실제 동작 보여주고 승인** |
| 5 | DB → 타입 → 백엔드 → 프론트 순서 무시 | **순서 엄수. 건너뛰기 금지** |

### 디자인 대조 교훈

| # | 교훈 | 방지법 |
|---|------|--------|
| 6 | 코드 수치만 보고 "일치" 판단 | **browse로 computed CSS 측정 필수** |
| 7 | 디자인 토큰 lineHeight를 단일행에 적용 → 높이 과다 | **computed line-height 측정. 단일행은 lineHeight 생략** |
| 8 | 하트 버튼(44px)이 카드 높이를 키움 | **음수 마진 확인 필수** |
| 9 | 페이지 배경색 불일치 | **섹션별 배경색 inspect로 확인** |
| 10 | placeholder 아이콘으로 이미지 대체 | **디자인에 이미지 있으면 코드에도 반드시 포함** |
| 11 | meta fontSize 불일치 (14 vs 13) | **inspect로 font-size computed 확인** |

### 코드 교훈

| # | 교훈 | 방지법 |
|---|------|--------|
| 12 | API 응답 래퍼 `{ success, data }` 이해 부족 | `result.data`로 접근 |
| 13 | import 순서 꼬임 → 번들러 크래시 | import를 파일 최상단에 모아서 작성 |
| 14 | node_modules 하위 폴더에 생성 | **src/ 루트에만 설치** |
| 15 | 네이티브 모듈 Expo Go 미지원 | 웹 전환으로 해결 |

### Prisma 7 교훈 (백엔드팀 참조)

| # | 교훈 | 방지법 |
|---|------|--------|
| 16 | `prisma-client` generator → ESM/CJS 충돌 | `prisma-client-js` 사용 |
| 17 | PrismaClient() 어댑터 없이 초기화 | `@prisma/adapter-pg` 필수 전달 |
| 18 | seed 설정 위치 혼동 | `prisma.config.ts`에 작성 |
| 19 | 루트 .env 수동 로드 필요 | `dotenv` + `config({ path: '../../.env' })` |
| 20 | 포트 충돌 (3000 이미 사용 중) | `lsof -ti:3000 \| xargs kill -9` |

---

## 웹 전환으로 해결되는 이전 문제들

| 이전 문제 | React Native | Next.js (웹) |
|----------|-------------|-------------|
| 지도 SDK | WebView 필요, 도메인 등록 실패 | **카카오맵 JS SDK 직접 사용** |
| 그라데이션 | LinearGradient 별도 설치 필요 | **CSS linear-gradient 기본 지원** |
| 디자인 대조 | RN 스타일 ≠ CSS (lineHeight 차이) | **디자인 HTML CSS를 거의 그대로 사용** |
| 배포 | 앱스토어 심사 1~3일 | **Vercel 즉시 배포** |
| 이미지 | Image 컴포넌트 + resizeMode | **img 태그 + object-fit: cover** |
| 스크롤 | gesture-handler 충돌 | **브라우저 기본 스크롤** |
