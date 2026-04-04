# 온유어런치 (On Your Lunch)

직장인들의 점심 메뉴 고민을 해결하는 모바일 앱.
회사 근처 맛집을 위치 기반으로 추천한다.

- **타겟:** 강남 오피스 밀집 지역(강남역/역삼역/선릉역 반경) 직장인
- **플랫폼:** 모바일 앱 (iOS/Android)
- **UX 벤치마크:** 배달의민족 (화이트 기반, 깔끔, 미니멀)
- **아키텍처:** 모노레포(A-1) + 모놀리스(B-1) + 크로스플랫폼(C-1) — DR-005

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | NestJS 11 + Prisma 6 + PostgreSQL 16 (PostGIS) |
| 모바일 | Expo 54 + React Native + expo-router + Zustand 5 + TanStack Query v5 |
| 인프라 | Railway (API + DB) + Cloudflare R2 (파일) + FCM (푸시) + Sentry (에러) |
| 외부 서비스 | 카카오 로컬 API, 카카오맵 SDK, Google OAuth, 카카오톡 공유 SDK |
| 빌드 | pnpm workspace + Turborepo |

---

## 프로젝트 구조

```
├── .docs/                        ← 문서 산출물
├── src/                          ← 개발 산출물 (pnpm workspace 모노레포)
│   ├── apps/
│   │   ├── api/                  ← NestJS 백엔드
│   │   │   ├── prisma/             스키마 + 시드 + 마이그레이션
│   │   │   ├── src/
│   │   │   │   ├── auth/           인증 (Google OAuth, JWT)
│   │   │   │   ├── user/           사용자 (프로필, 위치, 취향)
│   │   │   │   ├── restaurant/     식당 (CRUD, 검색, 지도)
│   │   │   │   ├── recommendation/ 추천 (알고리즘, 새로고침)
│   │   │   │   ├── eating-history/ 먹은 이력 (기록, 캘린더)
│   │   │   │   ├── favorite/       즐겨찾기
│   │   │   │   ├── share/          공유 (딥링크)
│   │   │   │   ├── notification/   푸시 알림
│   │   │   │   ├── category/       마스터 데이터
│   │   │   │   ├── event/          이벤트 로그
│   │   │   │   ├── common/         공통 (데코레이터, 필터)
│   │   │   │   └── prisma/         Prisma 서비스
│   │   │   └── test/               e2e 테스트
│   │   └── mobile/               ← Expo 앱 (프론트엔드)
│   │       ├── app/                expo-router 파일 기반 라우팅
│   │       │   ├── _layout.tsx       루트 레이아웃 (QueryClient, GestureHandler)
│   │       │   ├── (auth)/           인증 (login, terms)
│   │       │   ├── (onboarding)/     온보딩 3단계 (location, preference, exclusion)
│   │       │   └── (tabs)/           메인 탭 (각 탭이 독립 Stack 보유)
│   │       │       ├── home/           홈 탭 + 식당 상세 [id]
│   │       │       ├── explore/        탐색 탭 + 식당 상세 [id]
│   │       │       ├── history/        이력 탭 + 식당 상세 [id] + 기록 [restaurantId]
│   │       │       └── mypage-tab/     마이 탭 + 프로필/위치/취향/알림/탈퇴
│   │       ├── stores/             Zustand 스토어 (auth, onboarding, filter, explore)
│   │       ├── services/           API 클라이언트 (ky) + TanStack Query 훅
│   │       ├── constants/          디자인 토큰 상수
│   │       └── components/         공유 컴포넌트 + screens/ (탭 간 공유 화면)
│   └── packages/
│       └── shared-types/         ← 프론트↔백엔드 공유 타입
├── CLAUDE.md                     ← 이 파일
└── README.md
```

---

## 개발 명령어

`src/` 디렉토리에서 실행.

```bash
# 의존성
pnpm install

# 개발 서버
pnpm api:dev              # 백엔드 (watch 모드)
pnpm dev                  # 전체 워크스페이스

# 빌드 / 테스트 / 린트
pnpm api:build            # 백엔드 빌드
pnpm api:test             # 백엔드 단위 테스트
pnpm api:lint             # 백엔드 린트
pnpm build                # 전체 빌드
pnpm test                 # 전체 테스트
pnpm lint                 # 전체 린트
pnpm format               # Prettier 포맷팅

# DB (Prisma)
pnpm db:migrate           # 마이그레이션 생성 + 적용 (개발)
pnpm db:migrate:deploy    # 마이그레이션 적용 (프로덕션)
pnpm db:generate          # Prisma Client 재생성
pnpm db:studio            # Prisma Studio (DB GUI)
pnpm db:seed              # 시드 데이터 (카테고리 7건, 알레르기 6건)
```

**환경변수:** `src/apps/api/.env.example` → `.env`로 복사 후 값 채우기.

### 모바일 (Expo)

```bash
# 개발 서버 (Expo Go)
pnpm mobile:start          # 개발 서버 시작
pnpm mobile:ios             # iOS 시뮬레이터
pnpm mobile:android         # Android 에뮬레이터

# 빌드 (EAS Build)
pnpm mobile:build:dev       # 개발 빌드
pnpm mobile:build:preview   # 프리뷰 빌드
pnpm mobile:build:prod      # 프로덕션 빌드
```

**환경변수:** `src/apps/mobile/.env.example` → `.env`로 복사 후 API URL 설정.

---

## 문서 산출물 (.docs/)

| 폴더 | 용도 |
|------|------|
| `001_decision-making/` | 의사결정 기록 (DR) |
| `002_meeting-notes/` | 기획 회의록 |
| `003_research/` | 리서치 보고서 |
| `004_planning/specs/` | 기능 명세서 |
| `004_planning/screen/` | 화면 설계 |
| `004_planning/tech-spec/` | 기술 스펙 (백엔드/프론트/API/데이터) |
| `004_planning/erd/` | ERD |
| `004_planning/qa/` | QA 결과 |
| `005_design/` | 디자인 시스템 + 화면 디자인 |
| `999_references/` | 참고 문서 |
