# PACE 개발 진행 현황

> 최종 업데이트: 2026-03-18
> 기술 스택: NestJS + PostgreSQL 16 (백엔드) / React Native Expo + Next.js 15 (프론트엔드)
> 모노레포 위치: `/Users/sadqueen/Documents/My_Projects/PACE/`

---

## 인프라 / 공통

| 항목 | 상태 | 비고 |
|---|---|---|
| 모노레포 세팅 (Turborepo + pnpm) | ✅ 완료 | `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` |
| PostgreSQL 로컬 DB | ✅ 완료 | `pace_dev` DB, `pace` 유저 |
| NestJS 프로젝트 초기화 | ✅ 완료 | `apps/api/` — 13개 모듈 디렉토리 |
| Expo 모바일 초기화 | ✅ 완료 | `apps/mobile/` — Expo Router |
| Next.js 15 PC 웹 초기화 | ✅ 완료 | `apps/web/` |
| shared-types 패키지 | ✅ 완료 | `packages/shared-types/` |
| shared-utils 패키지 | ✅ 완료 | `packages/shared-utils/` — formatDuration, 집중률, 에빙하우스 |
| design-tokens 패키지 | ✅ 완료 | `packages/design-tokens/` — colors, typography, spacing |
| AppModule DB 연결 | ✅ 완료 | TypeORM + ConfigModule |

---

## 백엔드 (`apps/api/src/`)

| 모듈 | 상태 | 구현 파일 | 비고 |
|---|---|---|---|
| **auth** | ✅ 완료 | entity 3개, service, controller, jwt.strategy, guard, decorator | RTR, 소셜 로그인 구조, 전역 가드 |
| **onboarding** | ✅ 완료 | dto, service, controller, module | exam_type/d_day/daily_hours 저장, notification_settings 초기화 |
| **home** | ✅ 완료 | entity 5개, stats.service, playlists.service, home.controller | 오늘 요약, 빠른 선택, 추천 섹션 4개 |
| **search** | ✅ 완료 | entity 1개, dto 2개, service, controller, module | ILIKE 검색, 최근 검색어 CRUD, 카테고리 탐색 |
| **library** | ✅ 완료 | entity 1개, dto 2개, service, controller, module | getLibrary, savePlaylist, unsavePlaylist, getRecentlyPlayed |
| **playlist-detail** | ✅ 완료 | entity 2개(session, play-log), dto 2개, service, controller, module | getPlaylistDetail, startSession, endSession |
| **now-playing (play)** | ✅ 완료 | entity 1개(distraction-log), service, controller, module | 이탈감지 로그, daily_stats upsert |
| **mypage** | ✅ 완료 | dto 3개, service, controller, module | 프로필 조회/수정, 알림 설정, 회원탈퇴 소프트삭제 |
| **fact-check (stats)** | ✅ 완료 | dto 3개, service 확장, controller, module 업데이트 | 주간리포트, 과목분석, 스트릭, FactCheckReport 병렬 조합 |
| **notifications** | ✅ 완료 | entity 2개(push-token, notification-log), dto 2개, service, controller, module | 토큰등록, 목록조회, 읽음처리, FCM TODO |
| **review** | ✅ 완료 | entity 1개(review-schedule), dto 2개, service, controller, module | 에빙하우스 1/3/7일, completePlayLog 연동 |

---

## 프론트엔드 — 모바일 (`apps/mobile/`)

| 화면 | 상태 | 구현 파일 | 비고 |
|---|---|---|---|
| **auth (로그인)** | ✅ 완료 | `app/(auth)/login.tsx`, `stores/authStore.ts`, `lib/api.ts` | OAuth TODO, 자동 로그인, 401 인터셉터 |
| **onboarding** | ✅ 완료 | `app/(auth)/onboarding.tsx`, `stores/onboardingStore.ts` | 3단계 멀티스텝, 중단 복원 |
| **home** | ✅ 완료 | `app/(tabs)/index.tsx`, `components/routine/PlaylistCard.tsx` | HOME-001~007 |
| **search** | ✅ 완료 | `app/(tabs)/search.tsx`, `lib/api.ts` | 4가지 모드(browse/focus/results/category), 디바운스, optimistic 삭제 |
| **library** | ✅ 완료 | `app/(tabs)/library.tsx` | LIB-001~004, 필터탭, 롱프레스 저장취소 |
| **playlist-detail** | ✅ 완료 | `app/playlist/[id].tsx` | 히어로, 세션 리스트, 타입 배지, playlistApi |
| **now-playing** | ✅ 완료 | `app/now-playing.tsx`, `stores/timerStore.ts`, `components/player/MiniPlayer.tsx`, `app/(tabs)/_layout.tsx` | 타이머, AppState 이탈감지, 미니플레이어, 탭 네비게이터 |
| **mypage** | ✅ 완료 | `app/(tabs)/mypage.tsx`, `stores/mypageStore.ts` | 프로필, 편집 모달, 알림 토글, 로그아웃/탈퇴 |
| **fact-check** | ✅ 완료 | `app/fact-check.tsx` | 오늘요약, 7일 막대차트, 과목 집중률, 스트릭, 홈 연결 |

---

## 주요 기술 결정 기록

| 항목 | 결정 | 위치 |
|---|---|---|
| DB 엔진 | PostgreSQL 16 (MySQL → 전환) | DR-012 |
| 삭제 정책 | 전체 소프트 삭제 (`is_deleted`, `deleted_at`) | DR-013 |
| 알림 아키텍처 | 로컬/하이브리드/FCM 혼합 | DR-011 |
| 상태관리 | Zustand | `planning/tech-spec/frontend-structure.md` |
| 레포 전략 | Monorepo (Turborepo + pnpm) | `planning/tech-spec/project-structure.md` |
| 인프라 비용 | MVP ~$49/월 | `planning/tech-spec/infrastructure-cost.md` |

---

## 미완료 TODO (구현 중 발생)

| 항목 | 관련 화면 | 내용 |
|---|---|---|
| Apple/Google OAuth 실제 연결 | auth | `expo-apple-authentication`, `expo-auth-session` — 추후 진행 |
| `play_logs.session_id` FK 교체 | playlist-detail | ✅ 완료 — @ManyToOne(Session) 교체 완료 |
| `/fact-check` 라우트 연결 | home | ✅ 완료 — TodaySummaryCard 탭으로 연결 |
| `/mypage` 라우트 연결 | home | ✅ 완료 — 탭 네비게이터 4번째 탭으로 구성 |
| `(tabs)/_layout.tsx` 탭 네비게이터 구성 | 공통 | ✅ 완료 — Home/Search/Library/MyPage 4탭 |
| `pnpm install` 모노레포 루트 실행 | 공통 | ✅ 완료 — 심링크 생성, dayjs 이슈 해결 |
| `playlist/[id]` → `startTimer()` → `router.push('/now-playing')` 연결 | playlist-detail | ✅ 완료 — handlePlay 구현 |
| FCM firebase-admin 실제 연동 | notifications | firebase-admin 설치 후 sendNotification 구현 — 추후 진행 |
| `daily_stats` (user_id, date) UK 제약 | play | V4 마이그레이션 작성 완료. 운영 DB 적용 전 중복 행 확인 필요 |
