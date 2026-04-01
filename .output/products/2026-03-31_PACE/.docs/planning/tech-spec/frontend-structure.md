# PACE 프론트엔드 디렉토리 구조 설계

> 작성자: Jack Dawson (프론트엔드 리드)
> 작성일: 2026-03-18
> 상태: 초안
> 참조: `planning/tech-spec/frontend.md` (기술 스택 상세 의사결정)
> 병합 예정: `planning/tech-spec/project-structure.md` (이명환 모노레포 전략과 합산)

---

## 개요

이 문서는 PACE 프론트엔드(모바일 앱 + PC 웹)의 초기 디렉토리 구조와 초기 세팅 패키지 목록을 정의한다.
기술 스택 선정 근거 및 상세 정책(집중 모드, 알림 아키텍처 등)은 `frontend.md`에 분리 정리되어 있다.

이명환님 모노레포 전략(Monorepo vs Polyrepo) 결과와 합쳐져 `project-structure.md`로 통합될 예정이며,
이 파일은 **프론트엔드 섹션 단독 초안**이다.

---

## 1. 상태관리 라이브러리 권고

### 결론: Zustand (전역) + TanStack Query (서버 상태)

#### 비교 검토

| 항목 | Zustand | Jotai | Redux Toolkit |
|---|---|---|---|
| 보일러플레이트 | 거의 없음 | 없음 | 많음 |
| 타이머 1초 업데이트 최적화 | slice 단위 구독으로 리렌더 최소화 | atom 단위 구독 (비슷함) | 복잡한 selector 설정 필요 |
| DevTools | O | O | O (가장 강력) |
| React Native 지원 | O | O | O |
| 러닝 커브 | 낮음 | 낮음 | 높음 |
| 팀 규모 적합성 | 1인 리드에 최적 | 1인 리드에 적합 | 팀 규모가 클 때 유리 |
| 미들웨어 (persist, immer) | 내장 미들웨어로 간단히 추가 | 별도 라이브러리 | 기본 내장 |

**Zustand 선택 이유**

- `useTimerStore`처럼 1초마다 상태가 바뀌는 스토어에서 `subscribe` selector를 쓰면 구독한 컴포넌트만 리렌더 → 성능 최적화가 직관적이다.
- `persist` 미들웨어 + MMKV 어댑터 조합으로 인증 토큰, 설정값 퍼시스턴스를 3줄로 구현 가능.
- Jotai도 훌륭하지만, 스토어 단위로 책임 범위를 나누는 게 팀 협업과 디버깅에 더 명확하다.

**TanStack Query 선택 이유**

- API 응답 캐싱, 오프라인 뮤테이션 큐잉(`onlineManager`), `staleTime` 튜닝으로 불필요한 재요청 방지.
- Zustand가 서버 상태까지 담당하면 캐시 무효화 로직이 복잡해진다. 역할 분리가 맞다.

#### 스토어 분리 원칙

| 스토어 | 관리 상태 | 업데이트 빈도 |
|---|---|---|
| `usePlayerStore` | 재생 중인 루틴, 현재 세션 인덱스, 재생/정지 상태 | 세션 전환 시 |
| `useTimerStore` | 남은 시간, 경과 시간, 이탈 기록 | 1초 |
| `useSessionStore` | 세션 완료 이력, Fact-Check 데이터 축적 | 세션 완료 시 |
| `useAuthStore` | 유저 토큰, 프로필 | 로그인/로그아웃 시 |
| `useUIStore` | 모달 열림 여부, 토스트 등 UI 전역 상태 | UI 이벤트마다 |

---

## 2. 모노레포 전체 구조

> 이명환님 결정에 따라 확정. Turborepo 기반 모노레포 전제로 작성.

```
pace/                              # 모노레포 루트
├─ apps/
│   ├─ mobile/                     # React Native (Expo) — 학생용 모바일 앱
│   └─ web/                        # Next.js 15 — PC 웹 클라이언트
│
├─ packages/
│   ├─ shared-types/               # 공용 타입 (API 요청/응답, 도메인 모델)
│   ├─ shared-utils/               # 플랫폼 비의존 순수 유틸
│   └─ design-tokens/              # 디자인 토큰 단일 소스 (선택)
│
├─ turbo.json
├─ package.json                    # 루트 워크스페이스 설정
└─ tsconfig.base.json              # 공용 TypeScript 설정
```

---

## 3. React Native (Expo) 디렉토리 구조

### 3-1. 라우팅 설계 원칙

Expo Router 파일 기반 라우팅. Next.js App Router와 동일한 패턴으로 PC 웹과 경험을 공유한다.

- `(auth)` — 인증되지 않은 사용자 전용 그룹. 로그인/회원가입.
- `(onboarding)` — 최초 온보딩 3단계. 완료 후 재진입 불가.
- `(tabs)` — 메인 하단 탭 네비게이션. 4개 탭.
- `routine/[id]` — 루틴 카드 상세 (플레이리스트 상세).
- `now-playing` — 전체화면 모달. 하단에서 올라오는 sheet 트랜지션.

### 3-2. 전체 디렉토리

```
apps/mobile/
├─ app/                            # Expo Router — 화면(라우트) 정의
│   ├─ _layout.tsx                 # 루트 레이아웃 (폰트 로딩, 테마 Provider, Toast)
│   ├─ (auth)/
│   │   ├─ _layout.tsx
│   │   ├─ login.tsx               # 로그인 (소셜 로그인: Google / Apple / Kakao)
│   │   └─ signup.tsx              # 회원가입
│   ├─ (onboarding)/
│   │   ├─ _layout.tsx
│   │   ├─ index.tsx               # Step 1: 시험 목표 선택
│   │   ├─ schedule.tsx            # Step 2: D-Day / 일일 가용 시간 설정
│   │   └─ generating.tsx          # Step 3: AI 첫 주 플레이리스트 생성 중 (로딩)
│   ├─ (tabs)/
│   │   ├─ _layout.tsx             # 하단 탭 바 정의 (4탭 + 미니 플레이어 오버레이)
│   │   ├─ index.tsx               # Home — AI 추천 루틴 카드 그리드
│   │   ├─ search.tsx              # Search — 카테고리 탐색 + 키워드 검색
│   │   ├─ library.tsx             # Library — 좋아요/저장 + 직접 생성 루틴
│   │   └─ create.tsx              # Create — 커스텀 루틴 카드 생성
│   ├─ routine/
│   │   └─ [id].tsx                # 루틴 카드 상세 (커버 + 트랙 리스트)
│   └─ now-playing.tsx             # 전체화면 Now Playing 모달
│
├─ src/
│   ├─ components/                 # UI 컴포넌트
│   │   ├─ common/                 # 재사용 원자 컴포넌트
│   │   │   ├─ Button.tsx
│   │   │   ├─ Icon.tsx
│   │   │   ├─ Toast.tsx
│   │   │   ├─ ProgressBar.tsx
│   │   │   └─ Avatar.tsx
│   │   ├─ layout/                 # 구조 레이아웃 컴포넌트
│   │   │   ├─ Header.tsx          # 상단 블러 헤더 (루틴 상세 등)
│   │   │   ├─ TabBar.tsx          # 커스텀 하단 탭 바
│   │   │   └─ Drawer.tsx          # 좌측 드로어 (MyPage, 설정, 구독)
│   │   ├─ player/                 # 플레이어 관련 컴포넌트
│   │   │   ├─ MiniPlayer.tsx      # 하단 고정 미니 플레이어 (56px)
│   │   │   ├─ NowPlayingSheet.tsx # 전체화면 모달 시트 (Bottom Sheet)
│   │   │   ├─ PlayerControls.tsx  # ⏮ ⏸/▶ ⏭ 컨트롤
│   │   │   ├─ SessionProgress.tsx # 타이머 진행 바 + 시간 표시
│   │   │   └─ SessionIndicator.tsx # 점 인디케이터 (세션 진행도)
│   │   ├─ routine/                # 루틴 카드 관련 컴포넌트
│   │   │   ├─ RoutineCard.tsx     # 홈/라이브러리 카드 (커버 + 제목 + 메타)
│   │   │   ├─ TrackList.tsx       # 트랙 리스트 컨테이너
│   │   │   └─ TrackItem.tsx       # 개별 트랙 행 (세션명 + 시간 + 상태)
│   │   ├─ timer/                  # 타이머 전용 컴포넌트
│   │   │   ├─ TimerDisplay.tsx    # 큰 타이머 숫자 (56px, Now Playing 핵심)
│   │   │   └─ PauseOverlay.tsx    # 일시정지 상태 오버레이
│   │   └─ onboarding/             # 온보딩 전용 컴포넌트
│   │       ├─ GoalSelector.tsx    # 시험 목표 선택 카드
│   │       ├─ ScheduleInput.tsx   # D-Day / 가용시간 입력
│   │       └─ GeneratingAnimation.tsx # AI 플레이리스트 생성 중 애니메이션
│   │
│   ├─ stores/                     # Zustand 스토어
│   │   ├─ usePlayerStore.ts       # 재생 상태 (현재 루틴, 세션 인덱스, play/pause)
│   │   ├─ useTimerStore.ts        # 타이머 (남은 시간, 경과 시간, 이탈 기록)
│   │   ├─ useSessionStore.ts      # 세션 완료 이력, Fact-Check 데이터 축적
│   │   ├─ useAuthStore.ts         # 인증 (토큰, 프로필, 로그인 상태)
│   │   └─ useUIStore.ts           # UI 전역 상태 (모달, 토스트, 드로어)
│   │
│   ├─ hooks/                      # 커스텀 훅
│   │   ├─ useTimer.ts             # 타이머 로직 (startedAt + Date.now() diff 방식)
│   │   ├─ useAppState.ts          # AppState 감지 + 30초 버퍼 정책 (NP-004)
│   │   ├─ useBackgroundTask.ts    # expo-task-manager 백그라운드 타이머 등록/해제
│   │   ├─ useOfflineSync.ts       # 오프라인 데이터 로컬 축적 → 온라인 복귀 시 동기화
│   │   ├─ useSessionTransition.ts # 세션 전환 5초 카운트다운 로직 (NP-007)
│   │   └─ useNotifications.ts     # 푸시 알림 권한 요청, FCM 토큰 관리, 로컬 알림 예약
│   │
│   ├─ services/                   # 외부 의존성 레이어
│   │   ├─ api/
│   │   │   ├─ client.ts           # axios 인스턴스 + 인터셉터 (토큰 자동 갱신)
│   │   │   ├─ auth.ts             # 인증 API (소셜 로그인, 토큰 갱신)
│   │   │   ├─ routine.ts          # 루틴 카드 CRUD API
│   │   │   ├─ session.ts          # 세션 기록 업로드 API
│   │   │   └─ notification.ts     # FCM 토큰 등록, 로컬 알림 발송 동기화 API
│   │   └─ storage/
│   │       ├─ mmkv.ts             # MMKV 인스턴스 + KV 헬퍼 (토큰, 설정, 알림 발송 기록)
│   │       └─ watermelon.ts       # WatermelonDB 스키마 + 모델 (세션 기록, 오프라인 데이터)
│   │
│   ├─ queries/                    # TanStack Query 쿼리/뮤테이션 정의
│   │   ├─ routineQueries.ts       # 루틴 카드 목록/상세 쿼리
│   │   ├─ sessionMutations.ts     # 세션 기록 업로드 뮤테이션
│   │   └─ authQueries.ts          # 유저 프로필 쿼리
│   │
│   ├─ native/                     # 네이티브 모듈 브릿지
│   │   ├─ AppStateModule.ts       # iOS inactive / Android background 분기 처리
│   │   └─ LiveActivityModule.ts   # iOS Dynamic Island (Option B, MVP 이후 구현)
│   │
│   ├─ constants/
│   │   ├─ theme.ts                # 색상, 타이포, 간격 (디자인 토큰, Spotify 다크 테마)
│   │   ├─ config.ts               # API Base URL, 환경 변수 (env)
│   │   └─ timer.ts                # 버퍼 시간(30초), 미완료 임계값(15분) 등 정책 상수
│   │
│   └─ utils/
│       ├─ time.ts                 # 초↔분:초 포맷 변환, 경과 시간 계산
│       ├─ focusRate.ts            # 집중률 계산 (순공 시간 / 배정 시간 × 100)
│       └─ analytics.ts            # 이벤트 트래킹 헬퍼 (Fact-Check 데이터 수집)
│
├─ assets/
│   ├─ fonts/                      # Inter 폰트 (Spotify 벤치마크 타이포)
│   ├─ images/
│   └─ icons/
├─ modules/                        # Expo Modules API — 커스텀 네이티브 모듈 소스
├─ app.config.ts                   # Expo 앱 설정 (EAS, 번들 ID, 권한 등)
├─ babel.config.js
├─ tsconfig.json
└─ package.json
```

### 3-3. 컴포넌트 분리 기준

| 분류 | 기준 | 예시 |
|---|---|---|
| `common/` | 도메인 비의존, 어디서든 재사용 가능 | Button, Icon, Toast |
| `layout/` | 화면 구조를 잡는 컴포넌트 (앱 전체 1회 렌더) | Header, TabBar, Drawer |
| `player/` | Now Playing / 미니 플레이어 관련 | MiniPlayer, NowPlayingSheet |
| `routine/` | 루틴 카드 도메인에 종속 | RoutineCard, TrackItem |
| `timer/` | 타이머 표시에 특화 (1초 업데이트, 성능 민감) | TimerDisplay, PauseOverlay |
| `onboarding/` | 온보딩 단계에만 사용 (완료 후 번들에서 제거 검토) | GoalSelector |

> `timer/` 컴포넌트는 `useTimerStore`의 특정 slice만 구독하도록 엄격히 제한한다.
> 전체 스토어를 구독하면 타이머 외 상태 변경에도 리렌더가 발생해 60fps를 깎아먹는다.

---

## 4. Next.js 15 (PC 웹) 디렉토리 구조

### 4-1. 라우팅 설계 원칙

App Router 기반. 모바일 앱 탭 구조와 1:1 대응하되 웹 관습을 따른다.

- 루틴 카드 목록(Home), 검색, 루틴 상세 → SSR (Server Components). 초기 로딩 성능 확보.
- 플레이어, 타이머, 인증 상태 → Client Components. 상태가 있고 인터랙티브하기 때문.
- `(auth)` 그룹 → 인증 미완료 사용자 라우트 보호.

### 4-2. 전체 디렉토리

```
apps/web/
├─ app/                            # Next.js App Router
│   ├─ layout.tsx                  # 루트 레이아웃 (폰트, 테마 Provider, MiniPlayer 오버레이)
│   ├─ page.tsx                    # Home (SSR — 루틴 카드 추천 그리드)
│   ├─ search/
│   │   └─ page.tsx                # Search (SSR — 카테고리 + 검색 결과)
│   ├─ library/
│   │   └─ page.tsx                # Library (CSR — 유저 저장 루틴, 인증 필요)
│   ├─ routine/
│   │   └─ [id]/
│   │       └─ page.tsx            # 루틴 카드 상세 (SSR — 커버, 트랙 리스트)
│   └─ (auth)/
│       ├─ login/
│       │   └─ page.tsx
│       └─ signup/
│           └─ page.tsx
│
├─ src/
│   ├─ components/
│   │   ├─ common/                 # 모바일과 동일 분류 기준 (웹 전용 구현)
│   │   │   ├─ Button.tsx
│   │   │   ├─ Icon.tsx
│   │   │   └─ Toast.tsx
│   │   ├─ layout/
│   │   │   ├─ Header.tsx          # 상단 고정 헤더 (로고, 검색, 프로필)
│   │   │   ├─ Sidebar.tsx         # 좌측 사이드바 (모바일 탭 바 대응)
│   │   │   └─ MiniPlayer.tsx      # 하단 고정 미니 플레이어 바 (Spotify 데스크톱 레이아웃)
│   │   ├─ player/
│   │   │   └─ NowPlayingModal.tsx # 전체화면 오버레이 (웹 — sheet가 아닌 modal)
│   │   ├─ routine/                # 모바일과 동일 구조
│   │   │   ├─ RoutineCard.tsx
│   │   │   ├─ TrackList.tsx
│   │   │   └─ TrackItem.tsx
│   │   └─ timer/
│   │       ├─ TimerDisplay.tsx
│   │       └─ PauseOverlay.tsx
│   │
│   ├─ stores/                     # Zustand (모바일과 동일 구조, 웹 환경 퍼시스턴스)
│   │   ├─ usePlayerStore.ts
│   │   ├─ useTimerStore.ts
│   │   ├─ useSessionStore.ts
│   │   ├─ useAuthStore.ts         # localStorage persist (MMKV 대신)
│   │   └─ useUIStore.ts
│   │
│   ├─ hooks/
│   │   ├─ useTimer.ts             # Page Visibility API + Date.now() diff 방식 (모바일과 동일 원리)
│   │   ├─ useVisibilityChange.ts  # document.visibilitychange 감지 (탭 비활성화 감지)
│   │   └─ useOfflineSync.ts       # 오프라인 뮤테이션 큐 → 온라인 복귀 시 동기화
│   │
│   ├─ services/
│   │   └─ api/
│   │       ├─ client.ts           # axios 인스턴스 (모바일과 동일 패턴)
│   │       ├─ auth.ts
│   │       ├─ routine.ts
│   │       └─ session.ts
│   │
│   ├─ queries/                    # TanStack Query (모바일과 동일 구조)
│   │   ├─ routineQueries.ts
│   │   ├─ sessionMutations.ts
│   │   └─ authQueries.ts
│   │
│   └─ constants/
│       ├─ theme.ts                # Tailwind CSS Variables 디자인 토큰
│       └─ config.ts
│
├─ public/
├─ next.config.ts
├─ tailwind.config.ts
└─ package.json
```

### 4-3. SSR / CSR 분리 기준

| 화면/컴포넌트 | 렌더링 방식 | 이유 |
|---|---|---|
| Home (루틴 카드 목록) | SSR (Server Component) | SEO, 초기 로딩 성능 |
| Search 결과 | SSR | SEO, URL 공유 가능 |
| 루틴 카드 상세 | SSR | SEO (루틴 제목/설명 메타태그) |
| Library | CSR (Client Component) | 인증 필요, 유저별 데이터 |
| MiniPlayer, NowPlayingModal | CSR | 상태 있음, 인터랙티브 |
| TimerDisplay | CSR | 1초 업데이트, 클라이언트 상태 |
| 인증 화면 | CSR | 인터랙티브 폼 |

---

## 5. 공유 패키지 구조

> 플랫폼 비의존 로직만 포함. React Native API, DOM API, 브라우저 API 사용 금지.

```
packages/
├─ shared-types/
│   ├─ api.ts                      # API 요청/응답 타입 (이명환/인수 BE와 공유)
│   ├─ domain.ts                   # Routine, Session, User, Track 도메인 모델
│   └─ index.ts
│
├─ shared-utils/
│   ├─ timer.ts                    # startedAt + Date.now() diff 계산 로직
│   ├─ focusRate.ts                # 집중률 계산 (순공 시간 / 배정 시간 × 100)
│   ├─ ebbinghaus.ts               # 망각 곡선 복습 스케줄 계산 (1, 3, 7일)
│   ├─ timeFormat.ts               # 초↔분:초 포맷 변환
│   └─ index.ts
│
└─ design-tokens/                  # (선택적 패키지 — 지수 디자인 시스템과 연동)
    ├─ colors.ts                   # Spotify 다크 테마 기반 컬러 팔레트
    ├─ typography.ts               # Inter 폰트 스케일
    └─ spacing.ts                  # 8px 그리드 간격 체계
```

---

## 6. 핵심 패키지 목록

### 6-1. 모바일 앱 (apps/mobile)

```
# 프레임워크
expo@~52
react-native
expo-router

# 언어
typescript

# 상태 관리
zustand
@tanstack/react-query
immer

# 로컬 저장
react-native-mmkv
@nozbe/watermelondb

# 애니메이션 / 제스처
react-native-reanimated
react-native-gesture-handler
@gorhom/bottom-sheet

# 네이티브 기능 — 집중 모드
expo-task-manager
expo-background-fetch

# 네이티브 기능 — 알림
expo-notifications

# 소셜 로그인
expo-apple-authentication
@react-native-google-signin/google-signin
react-native-kakao-login

# 네트워크
axios

# 개발 도구
@tanstack/react-query-devtools
zustand/middleware (devtools)
```

### 6-2. PC 웹 (apps/web)

```
# 프레임워크
next@^15
react
react-dom

# 언어
typescript

# 상태 관리
zustand
@tanstack/react-query

# 스타일링
tailwindcss@^4
shadcn/ui (선택적 — PACE 디자인 토큰으로 오버라이드)

# 네트워크
axios

# 개발 도구
@tanstack/react-query-devtools
```

### 6-3. 공유 패키지 (packages/)

```
# 빌드 / 번들
typescript
tsup                               # 패키지 빌드 (ESM + CJS)
```

### 6-4. 루트 (모노레포)

```
turborepo
prettier
eslint
```

---

## 7. 주요 설계 결정 요약

| 항목 | 결정 | 근거 |
|---|---|---|
| 모노레포 도구 | Turborepo | 이명환님 결정에 따름. 빌드 캐시 + 병렬 태스크 |
| 모바일 프레임워크 | React Native (Expo 관리형) | 집중 모드 네이티브 API 접근 + PC 웹과 로직 공유 |
| PC 웹 프레임워크 | Next.js 15 (App Router) | SSR, React 기반 코드 공유, Vercel 배포 |
| 상태 관리 | Zustand + TanStack Query | 타이머 최적화 + 서버 상태 분리 |
| 로컬 저장 (모바일) | MMKV + WatermelonDB | MMKV: 동기 KV / WatermelonDB: 세션 로그 쿼리 |
| 애니메이션 | Reanimated 3 + Gesture Handler | UI thread 애니메이션 60fps 보장 |
| Now Playing 트랜지션 | @gorhom/bottom-sheet | Shared Element + 스와이프업 시트 구현 |
| 타이머 정밀도 | startedAt + Date.now() diff | setInterval 백그라운드 throttle 대응 |
| 알림 아키텍처 | 유형별 혼합 (로컬/하이브리드/FCM) | 상세 내용: `frontend.md` 섹션 10 참조 |

---

## 8. 미결 사항 (이명환/인수와 협의 필요)

| 항목 | 협의 대상 | 내용 |
|---|---|---|
| 모노레포 루트 구조 확정 | 이명환 | Turborepo 워크스페이스 설정, apps/ packages/ 경로 확정 |
| 오프라인 세션 동기화 API | 이명환 / 인수 | 충돌 해결 정책 (서버 우선 vs 클라이언트 우선) |
| FCM 토큰 등록 API 스펙 | 인수 | 토큰 갱신 시점, 멀티 디바이스 처리 방식 |
| 소셜 로그인 OAuth 플로우 | 인수 | ID Token 서버 검증 vs 클라이언트 처리 |
| 복습 알림 API 응답 스펙 | 이명환 / 인수 | `{ reviewDate, subject, notificationTime }` 필드 포함 요청 |
| 실시간 타이머 서버 동기화 여부 | 이명환 | MVP에서는 클라이언트 단독 처리로 잠정 합의, 최종 확인 필요 |

---

> 이 문서의 기술 스택 선정 근거, 집중 모드 상세 구현 전략, 알림 아키텍처 의사결정은
> `/Users/sadqueen/Documents/My_Projects/PACE/planning/tech-spec/frontend.md`에 분리 정리되어 있다.
