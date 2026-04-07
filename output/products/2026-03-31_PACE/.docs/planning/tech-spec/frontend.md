# PACE 프론트엔드 기술 스택 & 디렉토리 구조

> 작성자: Jack Dawson (프론트엔드 리드)
> 최종 수정: 2026-03-18
> 상태: 초안 (리뷰 전)

---

## 1. 의사결정 기준 (Decision Criteria)

기술 스택 선정 시 아래 우선순위를 기준으로 판단했다.

1. **집중 모드 구현 가능성** — iOS/Android 앱 이탈 감지, 백그라운드 타이머가 핵심 기능. OS 네이티브 API 접근이 필수.
2. **모바일 · PC 웹 코드 공유** — 잭 혼자 두 플랫폼 리드. 비즈니스 로직 재사용율을 높여야 한다.
3. **Spotify-style 애니메이션 품질** — Now Playing 스와이프업, 미니 플레이어 전환, 커버 블러 배경. 60fps 필수.
4. **오프라인 우선** — 타이머는 서버 의존 없이 로컬 동작. 세션 데이터 로컬 저장 후 동기화.
5. **팀 규모** — 프론트 모바일+웹 사실상 잭 1인. 생태계가 크고 레퍼런스가 풍부한 스택이 유리.

---

## 2. 모바일 앱 기술 스택

### 2-1. 프레임워크: React Native (Expo 관리형 워크플로우)

**선택 이유**

| 항목 | React Native (Expo) | Flutter | Native (Swift/Kotlin) |
|---|---|---|---|
| iOS/Android 동시 지원 | O | O | X (별도 코드베이스) |
| PC 웹과 코드 공유 | 비즈니스 로직 공유 가능 (React 기반) | 불가 (Dart) | 불가 |
| OS 네이티브 API 접근 | Expo Modules로 커스텀 네이티브 모듈 작성 가능 | Platform Channel로 가능 | 직접 접근 |
| 애니메이션 품질 | Reanimated 3 (UI thread 애니메이션, 60fps) | 기본 60fps | 최고 |
| 생태계 / 레퍼런스 | 매우 넓음 (JS/TS 개발자 풀) | 성장 중 | 좁음 |
| 잭 기존 스택 | 주력 | 보조 | 미사용 |

**Expo 선택 이유**
- `expo-task-manager` + `expo-background-fetch` → 백그라운드 타이머 구현
- `expo-notifications` → FCM 통합 (iOS APNs 포함) 단순화
- OTA 업데이트 (EAS Update) → 핫픽스 배포 속도 향상
- Expo Modules API → 커스텀 네이티브 모듈 작성 시 타입스크립트 인터페이스 자동 생성

> 단, 집중 모드 앱 이탈 감지는 `AppState` API + 네이티브 모듈 커스터마이징이 필요. 아래 2-4 참고.

---

### 2-2. 언어: TypeScript (strict mode)

- 런타임 에러 조기 차단. 타이머 상태, 세션 데이터 구조가 복잡하기 때문에 타입 안전성 필수.
- 백엔드(myunghwan, insoo)와 API 스펙을 공유 타입으로 관리 (`shared/types/` 패키지).

---

### 2-3. 상태 관리

#### 전역 상태: Zustand

**선택 이유**
- Redux 대비 보일러플레이트 없음. 타이머·재생 상태처럼 빈번하게 업데이트되는 상태에서 리렌더링 최적화가 쉽다.
- Immer 통합으로 불변성 처리 간소화.
- DevTools 지원.

**스토어 분리 원칙**

| 스토어 | 관리 상태 | 비고 |
|---|---|---|
| `usePlayerStore` | 재생 중인 루틴, 현재 세션 인덱스, 재생/정지 상태 | 핵심 |
| `useTimerStore` | 남은 시간, 경과 시간, 이탈 기록 | 1초 업데이트 |
| `useSessionStore` | 세션 완료 이력, Fact-Check 데이터 축적 | 오프라인 저장 대상 |
| `useAuthStore` | 유저 토큰, 프로필 | 앱 재실행 시 복원 |
| `useUIStore` | 모달 열림 여부, 토스트 등 UI 상태 | - |

#### 서버 상태: TanStack Query (React Query)

- API 호출, 캐싱, 동기화 담당.
- 오프라인 시 뮤테이션 큐잉 → `onlineManager`로 온라인 복귀 감지 후 자동 재요청.
- `staleTime` / `gcTime` 튜닝으로 루틴 카드 목록 불필요한 재요청 방지.

#### 로컬 퍼시스턴스: MMKV + WatermelonDB

| 용도 | 라이브러리 | 이유 |
|---|---|---|
| 인증 토큰, 설정, 단순 KV | MMKV | AsyncStorage 대비 10x 빠름. JSI 기반 동기 읽기 |
| 세션 기록, 오프라인 데이터 | WatermelonDB | SQLite 기반, 대용량 세션 로그 쿼리에 적합 |

---

### 2-4. 집중 모드 — 앱 이탈 감지 & 백그라운드 타이머

PACE의 핵심 기술 난이도 구간. 플랫폼별로 동작이 다르다.

#### AppState 이벤트 처리

```
active     → foreground (정상 실행)
inactive   → iOS 전용: 제어센터, 알림패널, 앱 스위처 진입 시
background → 다른 앱으로 전환, 홈 버튼
```

**30초 버퍼 정책 구현 (NP-004 정책 반영)**

```
AppState 변화 감지
└─ active → inactive/background
   ├─ inactiveStartTime = Date.now() 기록
   └─ 30초 타이머 시작
      ├─ 30초 내 active 복귀 → 버퍼 무효화, 이탈 기록 안 함
      └─ 30초 초과 → 이탈 확정, 타이머 정지, 이탈 시간 기록 시작
```

#### iOS 특이사항
- `inactive` 상태는 Android에 없음. iOS 제어센터/알림 패널은 `inactive`로만 떨어짐.
- `AppState` 이벤트만으로는 "제어센터 열기"와 "다른 앱 전환" 구분 불가 → 30초 버퍼로 커버.
- Dynamic Island / Live Activity: Option B(자율형) 집중 모드 구현 시 `expo-activity-kit` 또는 커스텀 네이티브 모듈 필요. MVP에서는 미구현.

#### Android 특이사항
- `background` 진입 시 OS가 프로세스를 죽일 수 있음.
- `expo-task-manager` + `TaskManager.defineTask(BACKGROUND_TIMER_TASK)` 로 백그라운드 실행 등록.
- Foreground Service 방식이 가장 안정적. 상태바 알림(Notification) 필수 표시 조건.

#### 백그라운드 타이머 정밀도 보장 전략
- `setInterval` 기반 타이머는 백그라운드에서 throttle됨 → 신뢰 불가.
- **시작 시각(`startedAt`) + `Date.now()` diff** 방식으로 실제 경과 시간 계산.
- 앱 복귀 시 `Date.now() - startedAt` 으로 누락된 시간 보정.

---

### 2-5. 네비게이션: Expo Router (파일 기반)

**선택 이유**
- Next.js 파일 기반 라우팅과 동일한 패턴 → 잭의 PC 웹(Next.js) 경험 그대로 적용.
- Deep link, Universal Link 설정이 Expo Router와 통합.
- 타입 안전 라우팅 (typed routes).

**라우팅 구조**

```
app/
├─ (auth)/           # 인증 미완료 사용자
│   ├─ login.tsx
│   └─ signup.tsx
├─ (onboarding)/     # 최초 온보딩
│   └─ index.tsx
├─ (tabs)/           # 메인 탭 네비게이션
│   ├─ index.tsx         # Home
│   ├─ search.tsx        # Search
│   ├─ library.tsx       # Library
│   └─ create.tsx        # Create
├─ routine/
│   └─ [id].tsx          # 루틴 카드 상세
├─ now-playing.tsx    # 전체화면 모달 (스와이프업)
└─ _layout.tsx
```

---

### 2-6. 애니메이션: React Native Reanimated 3 + Gesture Handler

- **Reanimated 3**: worklet 기반 UI thread 애니메이션. JS thread가 블로킹돼도 60fps 유지.
- **Gesture Handler**: 네이티브 수준 제스처 처리. Now Playing 스와이프업/다운, 미니 플레이어 드래그.
- **Skia (선택적)**: 커버 이미지 블러 배경 렌더링 성능이 문제가 될 경우 검토.

**Now Playing 트랜지션 전략**

```
미니 플레이어 (하단 고정, 56px 높이)
  └─ 스와이프업 or 탭
      └─ Shared Element Transition (커버 이미지, 제목)
          └─ 전체화면 Now Playing 모달 (하단에서 올라오는 sheet)
```

- `react-native-bottom-sheet` (Gorhom) 라이브러리로 미니→전체 시트 트랜지션 구현.
- 커버 이미지는 `Reanimated.SharedValue`로 크기/위치 보간.

---

### 2-7. 소셜 로그인

| 제공자 | 라이브러리 | 비고 |
|---|---|---|
| Google | `@react-native-google-signin/google-signin` | iOS/Android 모두 지원 |
| Apple | `expo-apple-authentication` | iOS App Store 필수 |
| Kakao | `react-native-kakao-login` | 국내 서비스 필수 |

---

### 2-8. 푸시 알림: Expo Notifications + FCM

- `expo-notifications` → FCM(Android) + APNs(iOS) 통합 처리.
- 알림 수신 시 포그라운드/백그라운드 분기 처리.
- 세션 전환 알림, 리텐션 푸시, 복습 스케줄 알림 모두 이 채널로 처리.
- 토큰 갱신 시 서버에 자동 업데이트 (insoo 백엔드와 API 협의 필요).

---

## 3. PC 웹 기술 스택

### 3-1. 프레임워크: Next.js 15 (App Router)

**선택 이유**
- React 기반 → 모바일 앱 컴포넌트, 훅, 비즈니스 로직 재사용.
- App Router + Server Components → 초기 로딩 성능. 루틴 카드 목록, 검색 결과는 SSR로 처리.
- `next/image` → 커버 이미지 최적화 자동화.
- Vercel 배포 → 별도 인프라 설정 없이 CI/CD.

### 3-2. 언어: TypeScript (strict mode)

모바일과 동일. `shared/types/` 패키지로 API 타입 공유.

### 3-3. 상태 관리

모바일과 동일한 구조 적용.

| 라이브러리 | 용도 |
|---|---|
| Zustand | 클라이언트 전역 상태 (플레이어, 타이머, 인증) |
| TanStack Query | 서버 상태, API 캐싱 |
| Zustand + localStorage | 인증 토큰, 설정값 퍼시스턴스 |

### 3-4. 스타일링: Tailwind CSS v4 + CSS Variables

- 다크 테마 고정 (MVP) → CSS Variables로 디자인 토큰 관리.
- 톰 하디(관리자 웹)와 Tailwind config 공유.
- 컴포넌트 레벨 스타일은 `shadcn/ui` 베이스 + PACE 디자인 토큰 오버라이드.

### 3-5. 웹 플레이어 타이머 (포커스 감지)

- `document.visibilitychange` 이벤트 → 탭 비활성화 감지.
- `Page Visibility API` + `requestAnimationFrame` 기반 타이머.
- 백그라운드 탭 시 브라우저 throttle 대응 → 모바일과 동일하게 `Date.now()` diff 방식 사용.

---

## 4. 공유 패키지 구조 (모바일 + 웹)

모노레포(Turborepo)로 구성. 비즈니스 로직과 타입을 패키지로 분리.

```
packages/
├─ shared-types/      # API 요청/응답 타입, 도메인 모델
├─ shared-utils/      # 타이머 계산 로직, 날짜 포맷, 집중률 계산 등
└─ shared-ui/         # (선택) 웹·앱 공용 디자인 토큰 (CSS Variables / StyleSheet)
```

> `shared-utils/`에는 플랫폼 비의존 순수 함수만 포함. React Native API나 DOM API 사용 금지.

---

## 5. 모바일 앱 디렉토리 구조

Expo Router 파일 기반 라우팅을 기준으로 한다.

```
apps/mobile/
├─ app/                          # Expo Router 라우팅 (화면)
│   ├─ _layout.tsx               # 루트 레이아웃 (폰트 로딩, 테마, 토스트)
│   ├─ (auth)/
│   │   ├─ _layout.tsx
│   │   ├─ login.tsx
│   │   └─ signup.tsx
│   ├─ (onboarding)/
│   │   ├─ _layout.tsx
│   │   ├─ index.tsx             # 목표 선택
│   │   ├─ schedule.tsx          # D-Day / 가용시간
│   │   └─ generating.tsx        # AI 플레이리스트 생성 중
│   ├─ (tabs)/
│   │   ├─ _layout.tsx           # 하단 탭 바 정의
│   │   ├─ index.tsx             # Home
│   │   ├─ search.tsx            # Search
│   │   ├─ library.tsx           # Library
│   │   └─ create.tsx            # Create
│   ├─ routine/
│   │   └─ [id].tsx              # 루틴 카드 상세 (플레이리스트 상세)
│   └─ now-playing.tsx           # 전체화면 Now Playing 모달
│
├─ src/
│   ├─ components/               # UI 컴포넌트
│   │   ├─ common/               # 버튼, 아이콘, 토스트 등 공용 원자 컴포넌트
│   │   ├─ layout/               # 헤더, 탭바, 드로어
│   │   ├─ player/               # MiniPlayer, NowPlayingSheet, ProgressBar, Controls
│   │   ├─ routine/              # RoutineCard, TrackList, TrackItem
│   │   ├─ timer/                # TimerDisplay, TimerProgressBar, SessionIndicator
│   │   └─ onboarding/           # OnboardingStep 컴포넌트들
│   │
│   ├─ stores/                   # Zustand 스토어
│   │   ├─ usePlayerStore.ts     # 재생 상태, 현재 루틴/세션
│   │   ├─ useTimerStore.ts      # 타이머 상태, 이탈 기록
│   │   ├─ useSessionStore.ts    # 세션 완료 이력, Fact-Check 데이터
│   │   ├─ useAuthStore.ts       # 인증 상태
│   │   └─ useUIStore.ts         # UI 전역 상태
│   │
│   ├─ hooks/                    # 커스텀 훅
│   │   ├─ useTimer.ts           # 타이머 로직 (startedAt diff 방식)
│   │   ├─ useAppState.ts        # AppState 감지 + 30초 버퍼 정책
│   │   ├─ useBackgroundTask.ts  # 백그라운드 타이머 등록/해제
│   │   ├─ useOfflineSync.ts     # 오프라인 데이터 축적 → 온라인 동기화
│   │   ├─ useSessionTransition.ts # 세션 전환, 카운트다운 로직
│   │   └─ useNotifications.ts  # 푸시 알림 권한, 토큰, 수신 처리
│   │
│   ├─ services/                 # API 통신 레이어
│   │   ├─ api/
│   │   │   ├─ client.ts         # axios 인스턴스, 인터셉터 (토큰 갱신)
│   │   │   ├─ auth.ts           # 인증 API
│   │   │   ├─ routine.ts        # 루틴 카드 API
│   │   │   ├─ session.ts        # 세션 기록 업로드 API
│   │   │   └─ notification.ts   # FCM 토큰 등록 API
│   │   └─ storage/
│   │       ├─ mmkv.ts           # MMKV 인스턴스, KV 헬퍼
│   │       └─ watermelon.ts     # WatermelonDB 스키마, 모델 정의
│   │
│   ├─ queries/                  # TanStack Query 쿼리/뮤테이션
│   │   ├─ routineQueries.ts
│   │   ├─ sessionMutations.ts
│   │   └─ authQueries.ts
│   │
│   ├─ native/                   # 네이티브 모듈 브릿지
│   │   ├─ AppStateModule.ts     # iOS inactive / Android background 처리
│   │   └─ LiveActivityModule.ts # iOS Dynamic Island (Option B, MVP 이후)
│   │
│   ├─ constants/
│   │   ├─ theme.ts              # 색상, 타이포, 간격 (디자인 토큰)
│   │   ├─ config.ts             # API base URL, 환경 변수
│   │   └─ timer.ts              # 버퍼 시간(30초), 미완료 임계값(15분) 등 정책 상수
│   │
│   └─ utils/
│       ├─ time.ts               # 초↔분:초 포맷 변환, 경과 시간 계산
│       ├─ focusRate.ts          # 집중률 계산 (순공시간 / 배정시간)
│       └─ analytics.ts          # 이벤트 트래킹 헬퍼
│
├─ assets/                       # 폰트, 이미지, 아이콘
├─ modules/                      # Expo Modules (커스텀 네이티브 모듈 소스)
├─ app.config.ts                 # Expo 앱 설정
├─ babel.config.js
├─ tsconfig.json
└─ package.json
```

---

## 6. PC 웹 디렉토리 구조

```
apps/web/
├─ app/                          # Next.js App Router
│   ├─ layout.tsx                # 루트 레이아웃 (폰트, 테마 Provider)
│   ├─ page.tsx                  # Home (SSR)
│   ├─ search/
│   │   └─ page.tsx
│   ├─ library/
│   │   └─ page.tsx
│   ├─ routine/
│   │   └─ [id]/
│   │       └─ page.tsx          # 루틴 카드 상세 (SSR)
│   └─ (auth)/
│       ├─ login/
│       └─ signup/
│
├─ src/
│   ├─ components/               # 모바일과 동일한 분류 기준
│   │   ├─ common/
│   │   ├─ layout/               # Header, Sidebar, MiniPlayer (하단 고정 바)
│   │   ├─ player/               # NowPlayingModal (웹용 전체화면 오버레이)
│   │   ├─ routine/
│   │   └─ timer/
│   │
│   ├─ stores/                   # Zustand (모바일과 동일 구조)
│   ├─ hooks/                    # 웹 전용 훅
│   │   ├─ useTimer.ts           # Page Visibility API 기반
│   │   ├─ useVisibilityChange.ts # document.visibilitychange 감지
│   │   └─ useOfflineSync.ts
│   │
│   ├─ services/                 # API 통신 (모바일과 공유 가능한 부분은 shared-utils로)
│   ├─ queries/
│   └─ constants/
│       └─ theme.ts              # Tailwind CSS Variables 토큰
│
├─ public/
├─ next.config.ts
├─ tailwind.config.ts
└─ package.json
```

---

## 7. 모노레포 전체 구조

```
pace/                            # 모노레포 루트
├─ apps/
│   ├─ mobile/                   # React Native (Expo)
│   └─ web/                      # Next.js (PC 웹)
│
├─ packages/
│   ├─ shared-types/             # 공용 타입 정의
│   │   ├─ api.ts                # API 요청/응답 타입
│   │   ├─ domain.ts             # Routine, Session, User 도메인 모델
│   │   └─ index.ts
│   │
│   ├─ shared-utils/             # 플랫폼 비의존 유틸
│   │   ├─ timer.ts              # startedAt diff 계산 로직
│   │   ├─ focusRate.ts          # 집중률 계산
│   │   ├─ ebbinghaus.ts         # 망각 곡선 복습 스케줄 계산
│   │   └─ index.ts
│   │
│   └─ design-tokens/            # (선택) 디자인 토큰 단일 소스
│       ├─ colors.ts
│       ├─ typography.ts
│       └─ spacing.ts
│
├─ turbo.json                    # Turborepo 설정
├─ package.json                  # 루트 워크스페이스
└─ tsconfig.base.json            # 공용 TypeScript 설정
```

---

## 8. 의존성 요약

### 모바일 앱 (핵심)

```
# 프레임워크
expo ~52
react-native

# 언어
typescript

# 네비게이션
expo-router

# 상태 관리
zustand
@tanstack/react-query
immer

# 로컬 저장
react-native-mmkv
@nozbe/watermelondb

# 애니메이션
react-native-reanimated
react-native-gesture-handler
@gorhom/bottom-sheet

# 네이티브 기능
expo-task-manager
expo-background-fetch
expo-notifications
expo-apple-authentication
@react-native-google-signin/google-signin
react-native-kakao-login

# 네트워크
axios
```

### PC 웹 (핵심)

```
# 프레임워크
next ^15
react

# 언어
typescript

# 상태 관리
zustand
@tanstack/react-query

# 스타일링
tailwindcss ^4
shadcn/ui (선택적)

# 네트워크
axios
```

---

## 9. 미결 사항 (백엔드 협의 필요)

| 항목 | 협의 대상 | 내용 |
|---|---|---|
| FCM 토큰 등록 API 스펙 | insoo | 토큰 갱신 시점, 멀티 디바이스 처리 |
| 오프라인 세션 데이터 동기화 API | myunghwan / insoo | 충돌 해결 정책 (서버 우선 / 클라이언트 우선) |
| 소셜 로그인 OAuth 플로우 | insoo | ID Token 검증 방식 (서버 검증 vs 클라이언트 처리) |
| 실시간 타이머 서버 동기화 여부 | myunghwan | MVP에서는 클라이언트 단독 처리로 결론 났으나 최종 확인 필요 |

---

## 10. 알림 아키텍처 (Notification Architecture)

> 작성일: 2026-03-18
> 배경: PO가 "모닝콜 등 시각 기반 알림을 서버 FCM 대신 디바이스 로컬에서 처리"하는 방식을 제안. 다른 서비스의 FCM 2분 오차 사례를 보고 정확성 우려에서 출발한 제안.

---

### 10-1. 세 가지 방식 정의

| 방식 | 흐름 | 장점 | 단점 |
|---|---|---|---|
| A. 완전 로컬 | 디바이스가 설정값 저장 → OS가 지정 시각에 알림 발생 → 앱 실행 시 서버에 발송 기록 동기화 | 정확도 최고 (ms 단위), 서버 부하 없음, 오프라인 동작 | 서버 데이터 필요한 알림 처리 불가, 기기 교체/재설치 시 알림 소멸 |
| B. 하이브리드 | 서버가 스케줄 계산 → 클라이언트에 예약 정보 전달 → 클라이언트가 로컬 알림 예약 | 서버 로직 유지 + 발동은 로컬 정확도 | 클라이언트가 앱 실행 시점에 예약 정보 수신해야 함 (앱 실행 안 하면 동기화 안 됨) |
| C. 서버 FCM | 서버 크론이 조건 확인 후 FCM 발송 (현재 구조) | 서버에서 모든 조건 판단 가능, 기기 교체/재설치 무관 | FCM 딜레이 (0~수분), 서버 크론 정밀도 의존, 네트워크 필요 |

---

### 10-2. FCM "2분 오차"의 실제 원인 분석

PO가 우려한 FCM 2분 오차는 FCM 자체의 문제가 아니다. 실제 원인은 서버 크론 구현 방식에 있다.

**오차 발생 구조**

```
서버 크론 매 1분 실행
  └─ "현재 시각과 알림 예약 시각이 같으면 FCM 발송" 판단
      → 크론이 08:00 이후 08:01에 실행되면 → 08:00 알림 miss
      → 08:01 크론이 "08:01 ~ 08:02 사이" 전체를 쿼리해야 miss 방지
```

즉, 크론을 매 1분 실행해도 쿼리 윈도우를 `[lastRun, now)` 범위로 설계하지 않으면 오차가 생긴다. **FCM 딜레이는 통상 1~3초 이내**이며, 크론 설계가 올바르면 체감 오차는 거의 없다.

단, 실제로 정밀도가 중요한 알림(모닝콜)은 로컬 알림이 더 유리한 것도 사실이다.

---

### 10-3. React Native (Expo)에서 완전 로컬 알림 구현 가능 여부

**결론: 가능하다. `expo-notifications`로 처리.**

`expo-notifications`의 `scheduleNotificationAsync`는 OS의 로컬 알림 스케줄러를 직접 호출한다.

```typescript
import * as Notifications from 'expo-notifications';

// 매일 08:00 반복 알림 예약
await Notifications.scheduleNotificationAsync({
  content: {
    title: '좋은 아침이에요!',
    body: '오늘도 시작해볼까요?',
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    hour: 8,
    minute: 0,
    repeats: true,  // 매일 반복
  },
});
```

**앱이 종료된 상태에서도 발동하는가?**

- iOS: 완전 종료(force quit) 상태에서도 로컬 알림 발동. OS가 직접 처리하며 앱 프로세스 불필요.
- Android: 마찬가지로 앱 종료 상태에서 발동. 단, Android 12+(API 31) 이상에서는 `SCHEDULE_EXACT_ALARM` 권한이 필요. Expo SDK 50+에서 자동 처리됨.
- Android 배터리 최적화(도즈 모드): `AlarmManager.setExactAndAllowWhileIdle()`로 예약된 알림은 도즈 모드에서도 발동. `expo-notifications`가 내부적으로 이 방식 사용.

**제약사항**

- iOS: 앱 1개당 스케줄 가능한 로컬 알림 최대 64개. 복습 알림이 많으면 한도 초과 위험.
- Android: 제한 없음 (실용적 범위에서).
- 앱 삭제 시 모든 로컬 알림 소멸 (당연한 동작).
- 기기 재부팅 시: iOS는 자동 복원. Android는 `BOOT_COMPLETED` 브로드캐스트 수신 후 재등록 필요 → `expo-notifications`가 자동 처리하나, 앱이 최소 1회는 실행되어야 함.

---

### 10-4. 알림 유형별 방식 분석 및 권장

#### NOTI-001. 세션 시작/종료 임박 (앱 내 알림)

**권장: 방식 해당 없음 (앱 내 처리)**

OS 푸시 알림이 아니다. 앱이 Foreground 상태이거나 Option B(자율형) 집중 모드에서 백그라운드 실행 중일 때 앱 내부에서 타이머 이벤트로 발생시킨다. 서버/로컬 알림 아키텍처 논의 범위 외.

---

#### NOTI-002-A. 모닝콜

**권장: A. 완전 로컬**

| 항목 | 판단 |
|---|---|
| 서버 데이터 필요 여부 | 없음 (사용자가 직접 설정한 시각만 사용) |
| 매일 반복 여부 | O → `repeats: true`로 단순 처리 |
| 정확도 | 로컬이 압도적으로 유리 (ms 단위 정밀도) |
| 오프라인 동작 | O |

**구현 방식**

- 사용자가 알림 설정에서 시각 변경 시 → 기존 로컬 알림 취소 후 재예약.
- 앱 재설치/기기 교체 시: 앱 첫 실행 → 서버에서 설정값 불러와서 재예약. 이 사이 기간에는 알림 미발송 (수용 가능한 edge case).
- 서버에는 "발송 기록" 동기화 불필요. 모닝콜은 발송 이력 추적 필요성이 낮음.

**FCM 대비 이점**: 정확도 + 서버 크론 부하 제거 + 오프라인 동작.

---

#### NOTI-002-B. 학습 리마인더

**권장: B. 하이브리드**

| 항목 | 판단 |
|---|---|
| 서버 데이터 필요 여부 | 있음 (오늘 학습 기록 있는지 확인해야 함) |
| 발송 조건 | 모닝콜 시각 + 2시간 경과 AND 오늘 학습 기록 없음 |
| 완전 로컬 가능 여부 | 불가. "오늘 학습 기록 없음" 조건은 서버가 확인해야 함 |

**구현 방식**

서버가 조건 판단 주체인 구조는 유지하되, 발동 방식을 최적화한다.

- 서버 크론이 `(모닝콜 시각 + 2시간)`에 해당 유저의 학습 기록 확인.
- 학습 기록 없으면 → FCM 발송 (방식 C 유지).
- 단, 클라이언트 측에서도 보조 로직 가능: 앱 실행 중이라면 앱 내에서 자체 판단 후 로컬 알림 발동 → FCM과 중복 발송 방지 플래그 필요.

**결론**: 조건 판단이 서버 데이터 의존이므로 완전 로컬 전환 불가. 서버 FCM 유지. 단, 크론 쿼리 윈도우 설계만 올바르게 하면 정밀도 문제 없음 (10-2 참고).

---

#### NOTI-002-C. 장기 미접속 알림

**권장: C. 서버 FCM (현행 유지)**

| 항목 | 판단 |
|---|---|
| 서버 데이터 필요 여부 | 있음 (마지막 접속 시각, 미접속 일수 계산) |
| 완전 로컬 가능 여부 | 불가. 앱을 실행하지 않은 상태를 감지해야 하므로 클라이언트가 판단할 수 없음 |

- 앱이 실행되지 않은 상태에서 "X일째 미접속"을 판단하는 주체는 서버밖에 없다.
- 로컬에서 "X일 후에 알림" 예약하는 방식은 가능하지만, 그 사이에 사용자가 앱을 실행하면 이미 접속한 것인데 알림이 발동하는 문제가 생긴다. 앱 실행 시 예약 취소 로직을 추가해야 하는데, 이는 결국 서버 FCM과 동일한 복잡도다.
- 서버 FCM 유지가 가장 적합.

---

#### NOTI-002-D. 에빙하우스 복습 알림

**권장: B. 하이브리드**

| 항목 | 판단 |
|---|---|
| 서버 데이터 필요 여부 | 있음 (복습 스케줄 데이터: 어떤 과목을, 언제 복습) |
| 발송 시각 | 복습 예정일 오전 9시 (고정) |
| iOS 64개 한도 | 주의 필요 |

**구현 방식**

명세서(NOTI-002-D 상세)에 이미 "복습 스케줄 예약 시 서버에 알림 예약"이라고 정의되어 있다. 이 구조를 하이브리드로 확장한다.

```
서버: 복습 스케줄 생성 시 → API 응답에 알림 예약 정보 포함
  └─ { reviewDate: "2026-03-21", subject: "수학", time: "09:00" }

클라이언트: 해당 정보 수신 시 → 로컬 알림 예약
  └─ scheduleNotificationAsync({ trigger: { date: new Date("2026-03-21T09:00:00") } })
```

**한계 및 대응**

- iOS 64개 제한: 에빙하우스 스케줄(1, 3, 7일)로 과목이 많으면 금방 도달. 현실적으로 MVP 범위에서는 한도 내 수용 가능하나, 추후 복습 알림이 많아지면 FCM으로 fallback하는 로직 필요.
- 앱 비실행 기간: 복습 예약 정보를 클라이언트에 전달하려면 앱을 최소 1회 실행해서 서버와 동기화해야 한다. 장기 미접속 유저는 동기화가 안 될 수 있음 → 이 경우 서버 FCM으로 fallback.
- **결론**: 하이브리드 기본 + 서버 FCM fallback 이중 구조 권장.

---

#### NOTI-002-E. 주간 리포트 알림

**권장: A. 완전 로컬 (단, 조건부)**

| 항목 | 판단 |
|---|---|
| 서버 데이터 필요 여부 | 발송 자체는 없음. 매주 일요일 20:00 고정. |
| 리포트 콘텐츠 | 알림 본문에 주간 데이터가 들어가지 않음 ("이번 주 학습 요약이 도착했어요") |
| 탭 시 이동 | Fact-Check 주간 리포트 화면 (데이터는 화면 진입 시 로드) |

**구현 방식**

- 매주 일요일 20:00 반복 로컬 알림 예약. 알림 본문은 고정 문구.
- 알림 탭 → 앱 진입 → Fact-Check 화면에서 실제 리포트 데이터를 API로 불러옴.
- 발송 트리거 자체에는 서버 데이터가 불필요하므로 완전 로컬 처리 가능.

단, 주간 리포트가 생성되지 않았는데 알림이 발동하는 edge case 존재 (초기 사용자, 데이터 없는 주). 화면 진입 시 "이번 주 리포트가 아직 준비 중이에요" 처리로 커버.

---

### 10-5. 권장 아키텍처 요약

| 알림 | 방식 | 근거 |
|---|---|---|
| NOTI-001 (세션 전환) | 앱 내부 처리 | OS 푸시 아님 |
| NOTI-002-A (모닝콜) | **A. 완전 로컬** | 서버 데이터 불필요, 정확도 최우선 |
| NOTI-002-B (학습 리마인더) | **C. 서버 FCM** | 학습 기록 조건이 서버 의존 |
| NOTI-002-C (장기 미접속) | **C. 서버 FCM** | 미접속 감지 자체가 서버 의존 |
| NOTI-002-D (복습 알림) | **B. 하이브리드** + FCM fallback | 스케줄 데이터는 서버, 발동은 로컬 |
| NOTI-002-E (주간 리포트) | **A. 완전 로컬** | 발송 트리거에 서버 데이터 불필요 |

---

### 10-6. PO 제안에 대한 결론

**"모닝콜은 로컬로 전환하자"는 제안 — 채택 권장.**

모닝콜(NOTI-002-A)과 주간 리포트(NOTI-002-E)는 완전 로컬 전환이 기술적으로 완벽하게 가능하며, 오히려 기존 FCM보다 우수하다. 특히 모닝콜은 사용자 경험 민감도가 높아 ms 단위 정확도가 체감 품질에 직결된다.

**로컬 전환으로 해결되지 않는 알림들 (NOTI-002-B, C)**

PO가 우려한 "2분 오차" 문제는 서버 크론의 쿼리 윈도우 설계 문제다. 백엔드(myunghwan, insoo)에 크론 구현 시 `[lastRun, now)` 범위 쿼리 방식을 사용하도록 요청하면 해결된다. FCM 딜레이 자체는 1~3초 수준.

**프론트엔드 구현 작업 범위**

로컬 알림으로 전환 시 프론트에서 추가로 필요한 작업:

1. `useNotifications.ts` 훅에 `scheduleLocalNotification`, `cancelLocalNotification`, `rescheduleAllLocalNotifications` 함수 추가.
2. 알림 설정 변경 → 로컬 알림 즉시 재예약 트리거.
3. 앱 최초 실행 / 재설치 후 첫 실행 시 서버 설정값으로 로컬 알림 복원.
4. Android: `BOOT_COMPLETED` 대응은 `expo-notifications`가 처리하나, 실제 동작 확인 필요 (디바이스 테스트 항목으로 추가).
5. iOS 64개 한도 모니터링 유틸 추가 (`Notifications.getAllScheduledNotificationsAsync()` 조회 후 경고 로깅).

---

### 10-7. 백엔드 협의 필요 사항

| 항목 | 협의 대상 | 내용 |
|---|---|---|
| 복습 스케줄 API 응답에 알림 예약 정보 포함 | myunghwan / insoo | `{ reviewDate, subject, notificationTime }` 필드 추가 요청 |
| 서버 FCM 크론 쿼리 윈도우 설계 | myunghwan / insoo | `[lastRun, now)` 범위 쿼리로 miss 방지 확인 |
| 로컬 알림 발송 기록 서버 동기화 여부 | insoo | 모닝콜 발송 이력 서버 저장 필요 여부 결정 필요 (분석용) |
| 복습 알림 FCM fallback 조건 | myunghwan / insoo | 앱 비실행 기간 임계값 (예: 3일 이상 미실행 시 FCM으로 대체 발송) |

---

### 10-8. 백엔드 협의 결과 — 클라이언트 구현 방향 확정

> 작성일: 2026-03-18
> 배경: 이명환(myunghwan)의 알림 아키텍처 구현 과정에서 백엔드 단독 결정 불가 항목 3건에 대한 클라이언트 구현 방향 확정.

---

#### [협의 1] 모닝콜 로컬 알림 발송 후 서버 동기화 시점

**클라이언트 결정: 앱 실행 시 일괄 동기화 (lazy sync)**

**근거**

모닝콜 로컬 알림은 앱 프로세스가 완전히 종료된 상태에서도 OS가 직접 발동시킨다. 발동 시점에 앱이 실행 중이라는 보장이 없으므로, 발동 즉시 서버에 기록을 전송하는 실시간 동기화는 구현 불가능하다.

**구현 방식**

```
1. 로컬 알림 발동 시
   └─ OS가 알림 발동 → 앱 프로세스 없음
   └─ 발동 기록을 MMKV에 로컬 저장
      { notificationType: "morning_call", firedAt: ISO8601 timestamp }

2. 다음 앱 실행 시 (앱 foreground 진입 시점)
   └─ MMKV에서 미전송 발송 기록 조회
   └─ 기록 존재하면 서버 동기화 API 호출
      POST /api/v1/notifications/sync
      body: { records: [{ type, firedAt }, ...] }
   └─ 서버 응답 200 확인 후 MMKV 기록 삭제
```

**실패 처리**

- 서버 전송 실패 시 MMKV 기록 유지 → 다음 앱 실행 시 재시도.
- 최대 보관 기간: 7일. 그 이상 된 미전송 기록은 클라이언트에서 자동 삭제 (stale 데이터 무의미).

**API 요청 사항 (myunghwan/insoo)**

- `POST /api/v1/notifications/sync` 엔드포인트 생성.
- 요청 body: `{ records: Array<{ type: string, firedAt: string }> }` (배열로 일괄 전송).
- 멱등 처리: 동일 `(userId, type, firedAt)`으로 중복 요청이 들어와도 중복 insert 방지.
- 모닝콜은 분석 목적 기록이므로 응답은 200 OK만으로 충분. 에러 시 클라이언트는 재시도 처리함.

---

#### [협의 2] iOS 64개 한도 초과 감지 및 FCM fallback 트리거

**클라이언트 결정: 클라이언트가 초과 감지 후 능동적으로 서버 API 호출. 별도 엔드포인트 필요.**

**근거**

서버가 주기적으로 클라이언트의 예약 수를 체크하는 방식은 서버가 클라이언트 내부 상태를 알 방법이 없어 구현 불가능하다. iOS 로컬 알림 예약 목록은 디바이스 로컬에만 존재하는 정보다. 따라서 초과 감지 주체는 클라이언트이며, 서버에 "FCM으로 대신 보내달라"는 요청을 능동적으로 보내는 구조가 맞다.

**구현 방식**

```
앱 실행 시 (또는 복습 알림 예약 직후)
  └─ Notifications.getAllScheduledNotificationsAsync() 호출
  └─ 현재 예약된 알림 수 카운트

  예약 수 <= 50개 (안전 마진 14개 확보)
    └─ 정상 처리, 추가 예약 진행

  예약 수 > 50개 (위험 임박)
    └─ POST /api/v1/notifications/fcm-fallback-request
       body: { remainingSlots: (64 - 현재예약수), userId }
    └─ 서버가 초과분 복습 알림을 FCM으로 발송 처리
    └─ 클라이언트는 해당 기간 로컬 예약 시도 중단
```

**임계값 기준: 64개 OS 한도 대비 50개를 경고선으로 설정**

- 모닝콜 1개 (매일 반복이라 1슬롯), 주간 리포트 1개 = 기본 2슬롯 상시 점유.
- 복습 알림은 과목 수 * 복습 주기(1/3/7일)만큼 증가. 과목 10개면 최대 30개 소비.
- 50개 초과 시점에 fallback 요청하면 실제 한도(64개)까지 14개 여유가 남아 다른 알림 타입 슬롯 보장 가능.

**API 요청 사항 (myunghwan/insoo)**

- `POST /api/v1/notifications/fcm-fallback-request` 엔드포인트 생성.
- 요청 body: `{ remainingSlots: number }` — 서버가 몇 개를 FCM으로 처리해야 하는지 판단하는 힌트.
- 서버는 해당 유저의 향후 복습 스케줄 중 로컬 예약이 불가능한 기간을 FCM 발송 큐에 등록.
- 클라이언트 재예약 시 (`rescheduleAllLocalNotifications` 호출 시) 슬롯이 다시 여유로워지면 fallback 해제 요청: `DELETE /api/v1/notifications/fcm-fallback-request` 또는 동일 엔드포인트에 `{ remainingSlots: N }` 재전송으로 처리 가능. 이명환님이 편한 방식으로 설계 요청.

---

#### [협의 3] 주간 리포트 로컬 예약 기준 데이터

**클라이언트 결정: 앱 실행 시 서버에서 설정값 수신 후 로컬 알림 예약. 설정 변경 시 즉시 재예약.**

**근거**

"매주 일요일 20:00 고정"이라도, 사용자가 알림 설정 화면에서 ON/OFF를 바꾸거나 향후 시각 변경 기능이 추가되면 서버 설정값이 필요해진다. 로컬 설정만 보는 방식은 기기 교체/재설치 시 설정이 초기화되는 문제가 있다. 서버를 단일 진실 소스(source of truth)로 유지하는 것이 맞다.

**구현 방식**

```
[앱 실행 시 — 초기 동기화]
  └─ GET /api/v1/notification-settings
     응답: { weekly_report_enabled: boolean, weekly_report_time: "20:00" }
  └─ weekly_report_enabled === true
      └─ 기존 주간 리포트 로컬 알림 취소 후 재예약
         (설정 동일하더라도 재예약 — 예약 누락 방지)
  └─ weekly_report_enabled === false
      └─ 기존 주간 리포트 로컬 알림 전부 취소

[설정 화면에서 변경 즉시]
  └─ PATCH /api/v1/notification-settings
     body: { weekly_report_enabled: boolean }
  └─ 서버 응답 200 확인 후
      └─ 로컬 알림 즉시 재예약 or 취소 (서버 동기화 완료 후 로컬 반영)
```

**재예약 로직 (`rescheduleWeeklyReport`)**

```typescript
// 매주 일요일 20:00 반복 예약
await Notifications.cancelScheduledNotificationAsync(WEEKLY_REPORT_NOTIFICATION_ID);

if (settings.weekly_report_enabled) {
  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_REPORT_NOTIFICATION_ID,  // 고정 ID로 덮어쓰기
    content: {
      title: '이번 주 학습 요약이 도착했어요',
      body: 'Fact-Check 리포트를 확인해보세요',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,  // 일요일 (1 = 일, 2 = 월 ... expo-notifications 기준)
      hour: 20,
      minute: 0,
    },
  });
}
```

- `identifier`를 고정값(`WEEKLY_REPORT_NOTIFICATION_ID`)으로 사용해 중복 예약 방지.
- `cancelScheduledNotificationAsync` 후 재예약하는 패턴으로 항상 최신 설정 반영.

**API 요청 사항 (myunghwan/insoo)**

- `GET /api/v1/notification-settings` 응답에 `weekly_report_enabled` (boolean), `weekly_report_time` (string, "HH:mm" 형식) 포함 요청.
- `weekly_report_time`은 MVP에서는 "20:00" 고정값이더라도 필드 자체는 API에 포함시켜달라 — 향후 사용자 설정 기능 추가 시 클라이언트 코드 변경 없이 서버값만 바꾸면 됨.
- 설정 변경은 기존 mypage 설정 PATCH 엔드포인트에 통합해도 무방. 이명환님 판단에 따름.
