# PACE 프로젝트 구조 명세

> 작성자: 이명환 (백엔드 아키텍트)
> 작성일: 2026-03-18
> 상태: 확정
> 연관 문서:
>   - `planning/tech-spec/backend.md` — 백엔드 기술 스택 상세
>   - `planning/tech-spec/frontend.md` — 프론트엔드 기술 스택 상세 (잭 작성)
>   - `planning/erd/PACE_ERD.md` — 데이터베이스 ERD

---

## 1. 레포 전략 — Monorepo (Turborepo) 채택

### 1-1. 결정: Monorepo 단일 레포

**Polyrepo 미채택 이유:**

| 비교 항목 | Monorepo | Polyrepo |
|---|---|---|
| API 타입 공유 | `packages/shared-types`로 즉시 공유. 타입 불일치 빌드 단계에서 차단 | 각 레포가 API 스펙을 수동으로 동기화. 드리프트 발생 위험 |
| 공통 유틸 재사용 | `packages/shared-utils`에 타이머 계산, 집중률, 망각 곡선 로직 단일 관리 | 복사-붙여넣기 또는 별도 npm 패키지 발행. 오버킬 |
| 2인 구현 팀 | 잭(프론트) + 인수(백엔드) 각각 별도 레포를 관리할 이유 없음. PR 리뷰, CI 파이프라인 단일화 | 서비스별 레포 유지보수 비용이 팀 규모 대비 과다 |
| 개발 환경 | 루트에서 `turbo dev` 한 번으로 전체 앱 실행 | 서비스마다 별도 실행 명령. 로컬 환경 복잡도 증가 |
| 배포 독립성 | Turborepo `pipeline` 설정으로 앱별 독립 배포 유지 | Monorepo 대비 이 부분만 유리. MVP 규모에서 큰 의미 없음 |

**핵심 근거:** PACE 3개 클라이언트(모바일, PC 웹, 관리자 웹)는 모두 동일한 API를 사용하고, API 타입을 공유해야 한다. 2인 구현팀 규모에서 레포를 쪼개는 것은 관리 비용만 올라간다. Turborepo는 캐시 기반 빌드 최적화로 Monorepo의 빌드 속도 단점을 제거한다.

---

### 1-2. 관리자 웹 레포 통합 결정

tom-hardy가 담당하는 관리자 웹도 동일 Monorepo에 포함한다 (`apps/admin`). 이유:

- 관리자 웹도 동일 백엔드 API를 사용하므로 `shared-types` 패키지를 그대로 재사용한다.
- Tailwind config, 디자인 토큰을 잭 담당 PC 웹과 공유 가능.
- 관리자 웹 배포 파이프라인만 별도 Turborepo pipeline으로 분리하면 독립 배포 유지.

---

## 2. 전체 프로젝트 디렉토리 구조

```
pace/                                    # Monorepo 루트
│
├── apps/                                # 실행 가능한 앱
│   ├── mobile/                          # React Native (Expo) — 잭 담당
│   ├── web/                             # Next.js 15 PC 웹 — 잭 담당
│   ├── admin/                           # Next.js 관리자 웹 — tom-hardy 담당
│   └── api/                             # NestJS API 서버 — 인수 담당 (명환 설계)
│
├── packages/                            # 앱 간 공유 패키지
│   ├── shared-types/                    # API 요청/응답 타입, 도메인 모델
│   ├── shared-utils/                    # 플랫폼 비의존 유틸 (타이머, 집중률, 망각 곡선)
│   └── design-tokens/                   # 색상, 타이포, 간격 디자인 토큰
│
├── turbo.json                           # Turborepo 파이프라인 설정
├── package.json                         # 루트 워크스페이스 (pnpm workspaces)
├── pnpm-workspace.yaml                  # pnpm 워크스페이스 정의
└── tsconfig.base.json                   # 공용 TypeScript 기본 설정
```

**패키지 매니저: pnpm**
- npm 대비 디스크 효율 (hoisting + hard link).
- Turborepo와 공식 권장 조합.
- `pnpm-workspace.yaml`로 워크스페이스 구성.

---

## 3. NestJS 백엔드 디렉토리 구조 (`apps/api/`)

### 3-1. 모듈 분리 기준

도메인(비즈니스 기능 단위)으로 모듈을 분리한다. 기술적 역할(controller, service)이 아니라 **도메인이 폴더 구분 기준**이다.

| 모듈 | 담당 도메인 | 핵심 엔드포인트 |
|---|---|---|
| auth | 인증/인가, 소셜 로그인, 토큰 관리 | POST /auth/signup, /auth/login, /auth/refresh, /auth/logout |
| users | 사용자 프로필, 계정 설정 | GET/PATCH /users/me, DELETE /users/me |
| onboarding | 온보딩 데이터 저장 | POST /onboarding |
| playlists | 플레이리스트 + 세션 CRUD, 검색 | GET/POST/PATCH/DELETE /playlists |
| library | 좋아요, 최근 재생 | GET /library, POST/DELETE /library/like/:id |
| play | 세션 실행 기록 (Now Playing 핵심) | POST /play/start, PATCH /play/:id/end, POST /play/:id/distraction |
| stats | 학습 통계, Fact-Check 리포트 | GET /stats/daily, /stats/weekly, /stats/fact-check |
| review | 에빙하우스 복습 스케줄링 | POST /review/schedule, GET /review/upcoming |
| notifications | 알림 설정, 알림 로그, FCM 서비스 | GET /notifications, PATCH /notifications/settings, POST /notifications/sync |
| search | 검색, 검색 히스토리 | GET /search, DELETE /search/history |
| upload | S3 Pre-signed URL 발급 | POST /upload/presigned-url |
| admin | 관리자 전용 API (별도 권한 가드) | /admin/playlists, /admin/users, /admin/stats |
| jobs | 배치 잡 스케줄러 (@nestjs/schedule) | (HTTP 엔드포인트 없음, 내부 크론) |

### 3-2. 전체 디렉토리 트리

```
apps/api/
├── src/
│   ├── main.ts                              # 앱 엔트리포인트. NestFactory.create()
│   ├── app.module.ts                        # 루트 모듈. 전체 모듈 조립
│   │
│   ├── config/                              # 환경 설정
│   │   ├── database.config.ts               # TypeORM DataSource 설정 (PostgreSQL 16, KST timezone)
│   │   ├── jwt.config.ts                    # JWT secret, expiration 설정
│   │   ├── firebase.config.ts               # firebase-admin 초기화
│   │   └── s3.config.ts                     # AWS S3 클라이언트 설정
│   │
│   ├── common/                              # 공통 유틸리티 (도메인 무관)
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts    # @CurrentUser() 커스텀 데코레이터
│   │   │   └── public.decorator.ts          # @Public() — JWT Guard 예외 처리
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts     # 전역 예외 필터 (표준 에러 응답 포맷)
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts            # 전역 JWT 인증 가드
│   │   │   └── roles.guard.ts               # 관리자/사용자 권한 분리
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts      # 표준 응답 래퍼 { success, data, message }
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts           # class-validator 기반 DTO 검증
│   │   └── utils/
│   │       ├── date.util.ts                 # KST 날짜 계산 유틸 (dayjs 기반)
│   │       └── pagination.util.ts           # 커서/오프셋 페이지네이션 헬퍼
│   │
│   ├── modules/                             # 도메인 모듈
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts          # passport-jwt
│   │   │   │   ├── google.strategy.ts       # passport-google-oauth20
│   │   │   │   ├── apple.strategy.ts        # passport-apple
│   │   │   │   └── kakao.strategy.ts        # 직접 구현 (passport 없음)
│   │   │   └── dto/
│   │   │       ├── signup.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts           # users 테이블 TypeORM Entity
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── onboarding/
│   │   │   ├── onboarding.module.ts
│   │   │   ├── onboarding.controller.ts
│   │   │   ├── onboarding.service.ts
│   │   │   └── dto/
│   │   │       └── onboarding.dto.ts
│   │   │
│   │   ├── playlists/
│   │   │   ├── playlists.module.ts
│   │   │   ├── playlists.controller.ts
│   │   │   ├── playlists.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── playlist.entity.ts
│   │   │   │   ├── playlist-exam-type.entity.ts
│   │   │   │   └── session.entity.ts        # 세션(트랙) 엔티티. playlists 모듈 소속
│   │   │   └── dto/
│   │   │       ├── create-playlist.dto.ts
│   │   │       └── update-playlist.dto.ts
│   │   │
│   │   ├── library/
│   │   │   ├── library.module.ts
│   │   │   ├── library.controller.ts
│   │   │   ├── library.service.ts
│   │   │   └── entities/
│   │   │       └── user-playlist.entity.ts  # 좋아요/저장 관계 테이블
│   │   │
│   │   ├── play/                            # Now Playing 핵심 — 세션 실행 기록
│   │   │   ├── play.module.ts
│   │   │   ├── play.controller.ts
│   │   │   ├── play.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── play-log.entity.ts       # play_logs 테이블
│   │   │   │   └── distraction-log.entity.ts # distraction_logs 테이블
│   │   │   └── dto/
│   │   │       ├── start-play.dto.ts
│   │   │       ├── end-play.dto.ts
│   │   │       └── distraction.dto.ts
│   │   │
│   │   ├── stats/
│   │   │   ├── stats.module.ts
│   │   │   ├── stats.controller.ts
│   │   │   ├── stats.service.ts
│   │   │   └── entities/
│   │   │       └── daily-stat.entity.ts     # daily_stats 테이블
│   │   │
│   │   ├── review/
│   │   │   ├── review.module.ts
│   │   │   ├── review.controller.ts         # GET /review/upcoming 응답에 scheduled_date 포함
│   │   │   │                                # → 클라이언트 로컬 알림 예약용 (DR-011 하이브리드)
│   │   │   ├── review.service.ts
│   │   │   └── entities/
│   │   │       └── review-schedule.entity.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── fcm.service.ts               # FCM 발송 전용 서비스 (firebase-admin 래핑)
│   │   │   └── entities/
│   │   │       ├── notification.entity.ts
│   │   │       ├── notification-setting.entity.ts
│   │   │       ├── device-token.entity.ts
│   │   │       └── notification-log-sync-record.entity.ts  # 로컬 알림 동기화 기록
│   │   │
│   │   ├── search/
│   │   │   ├── search.module.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   └── entities/
│   │   │       └── search-history.entity.ts
│   │   │
│   │   └── upload/
│   │       ├── upload.module.ts
│   │       ├── upload.controller.ts
│   │       └── upload.service.ts
│   │
│   ├── jobs/                                # 배치 잡 (@nestjs/schedule 기반)
│   │   ├── jobs.module.ts
│   │   ├── review-skip.job.ts               # 매일 00:10 KST — 복습 만료 처리 (REV-003)
│   │   ├── user-hard-delete.job.ts          # 매일 02:00 KST — 탈퇴 유예 7일 초과 물리 삭제 (AUTH-006)
│   │   ├── learning-reminder.job.ts         # 매분 실행 — 학습 리마인더 FCM (NOTI-002-B)
│   │   ├── inactive-reminder.job.ts         # 매일 10:00 KST — 장기 미접속 FCM (NOTI-002-C)
│   │   ├── review-fcm-fallback.job.ts       # 매일 09:00 KST — iOS 64개 한도 초과 FCM (NOTI-002-D)
│   │   └── daily-stats-upsert.job.ts        # 매일 00:05 KST — daily_stats 야간 집계 보정
│   │   # [DR-011 제거됨] morning-call.job.ts    → 클라이언트 로컬 알림으로 전환
│   │   # [DR-011 제거됨] weekly-report.job.ts   → 클라이언트 로컬 알림으로 전환
│   │
│   └── admin/                               # 관리자 전용 API (RolesGuard — ADMIN 권한)
│       ├── admin.module.ts
│       ├── admin-playlists.controller.ts    # 공식 플레이리스트 관리
│       ├── admin-users.controller.ts        # 사용자 조회/정지 처리
│       └── admin-stats.controller.ts        # 서비스 지표 대시보드
│
├── migrations/                              # TypeORM 마이그레이션 파일
│   └── (자동 생성: TIMESTAMP-InitSchema.ts)
│
├── test/                                    # E2E 테스트
│   └── app.e2e-spec.ts
│
├── .env                                     # 로컬 환경 변수 (gitignore)
├── .env.example                             # 환경 변수 템플릿 (커밋 대상)
├── docker-compose.yml                       # 로컬 개발용 (API + PostgreSQL)
├── Dockerfile                               # 프로덕션 멀티 스테이지 빌드
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

### 3-3. 모듈 내부 구조 규칙

각 도메인 모듈은 아래 구성을 따른다. 없는 레이어는 파일을 만들지 않는다.

```
{domain}/
├── {domain}.module.ts       # NestJS 모듈 정의. providers, controllers, exports 선언
├── {domain}.controller.ts   # HTTP 요청 진입점. DTO 수신 → Service 호출 → 응답 반환
├── {domain}.service.ts      # 비즈니스 로직. Repository 또는 TypeORM Repository 사용
├── entities/
│   └── {entity}.entity.ts   # TypeORM Entity. DB 테이블과 1:1 대응
└── dto/
    ├── create-{domain}.dto.ts   # 생성 요청 DTO (class-validator 데코레이터)
    └── update-{domain}.dto.ts   # 수정 요청 DTO (PartialType 활용)
```

**Repository 레이어 별도 파일 미생성 원칙:**
TypeORM `@InjectRepository(Entity)` 방식을 사용하면 Service 파일 내에서 직접 Repository를 주입할 수 있다. 복잡한 QueryBuilder가 필요한 경우(stats 집계, 연속 학습일 계산 등)에만 `{domain}.repository.ts`를 별도 생성한다. MVP 단계에서 추상화 계층을 과도하게 추가하지 않는다.

---

## 4. 공유 패키지 구조 (`packages/`)

### 4-1. `packages/shared-types/`

```
packages/shared-types/
├── src/
│   ├── api/
│   │   ├── auth.types.ts          # 회원가입/로그인 요청·응답 타입
│   │   ├── playlist.types.ts      # 플레이리스트 API 타입
│   │   ├── play.types.ts          # 세션 시작/종료/이탈 API 타입
│   │   ├── stats.types.ts         # 통계, Fact-Check 응답 타입
│   │   ├── review.types.ts        # 복습 스케줄 API 타입
│   │   └── notification.types.ts  # 알림 설정, 동기화 API 타입
│   ├── domain/
│   │   ├── user.ts               # User 도메인 모델
│   │   ├── playlist.ts           # Playlist, Session 도메인 모델
│   │   └── enums.ts              # ExamType, DailyHours, NotificationType 등 공용 Enum
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4-2. `packages/shared-utils/`

```
packages/shared-utils/
├── src/
│   ├── timer.ts           # startedAt diff 기반 경과 시간 계산 (플랫폼 비의존)
│   ├── focusRate.ts       # 집중률 계산: (순공시간) / (배정시간) * 100
│   ├── ebbinghaus.ts      # 망각 곡선 복습 날짜 계산 (+1, +3, +7일)
│   ├── dateKst.ts         # KST 기준 날짜 포맷·비교 유틸
│   └── index.ts
├── package.json
└── tsconfig.json
```

> **주의:** `shared-utils`에는 React, React Native, DOM API, Node.js API를 일절 사용하지 않는다. 순수 TypeScript 함수만 포함한다.

### 4-3. `packages/design-tokens/`

```
packages/design-tokens/
├── src/
│   ├── colors.ts          # Spotify 다크 테마 기반 색상 팔레트
│   ├── typography.ts      # 폰트 크기, 자간, 줄 간격
│   ├── spacing.ts         # 간격(4px 기반 스케일)
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 5. 핵심 패키지 목록 (백엔드 `apps/api/package.json`)

### 5-1. dependencies

| 패키지 | 버전 목표 | 용도 |
|---|---|---|
| `@nestjs/core` | ^10 | NestJS 코어 |
| `@nestjs/common` | ^10 | 공통 데코레이터, 파이프, 가드 |
| `@nestjs/platform-express` | ^10 | Express 어댑터 |
| `@nestjs/config` | ^3 | 환경 변수 관리 (ConfigModule) |
| `@nestjs/jwt` | ^10 | JWT 발급/검증 |
| `@nestjs/passport` | ^10 | Passport 통합 |
| `@nestjs/schedule` | ^4 | 배치 잡 크론 스케줄러 |
| `@nestjs/typeorm` | ^10 | TypeORM NestJS 통합 |
| `typeorm` | ^0.3 | ORM |
| `pg` | ^8 | PostgreSQL 드라이버 |
| `passport` | ^0.7 | Passport 코어 |
| `passport-jwt` | ^4 | JWT 전략 |
| `passport-google-oauth20` | ^2 | Google OAuth2 전략 |
| `passport-apple` | ^2 | Apple Sign In 전략 |
| `class-validator` | ^0.14 | DTO 유효성 검증 |
| `class-transformer` | ^0.5 | DTO 직렬화/역직렬화 |
| `firebase-admin` | ^12 | FCM 서버 사이드 발송 |
| `@aws-sdk/client-s3` | ^3 | S3 Pre-signed URL |
| `@aws-sdk/s3-request-presigner` | ^3 | Pre-signed URL 생성 |
| `dayjs` | ^1 | KST 날짜 계산 (dayjs + dayjs/plugin/timezone) |
| `dayjs/plugin/timezone` | — | timezone 플러그인 (dayjs 포함) |
| `dayjs/plugin/utc` | — | utc 플러그인 (dayjs 포함) |
| `bcrypt` | ^5 | 비밀번호 해시 |
| `reflect-metadata` | ^0.2 | TypeORM 데코레이터 메타데이터 |
| `rxjs` | ^7 | NestJS 의존성 |

### 5-2. devDependencies

| 패키지 | 버전 목표 | 용도 |
|---|---|---|
| `@nestjs/cli` | ^10 | NestJS CLI (모듈/서비스/컨트롤러 생성) |
| `@nestjs/testing` | ^10 | 유닛 테스트 모듈 |
| `@types/node` | ^20 | Node.js 타입 |
| `@types/passport-jwt` | ^4 | passport-jwt 타입 |
| `@types/passport-google-oauth20` | ^2 | Google OAuth2 타입 |
| `@types/bcrypt` | ^5 | bcrypt 타입 |
| `@types/express` | ^4 | Express 타입 |
| `typescript` | ^5 | TypeScript 컴파일러 |
| `ts-node` | ^10 | ts-node (마이그레이션 CLI) |
| `ts-jest` | ^29 | Jest TypeScript 변환기 |
| `jest` | ^29 | 테스트 프레임워크 |
| `@types/jest` | ^29 | Jest 타입 |
| `eslint` | ^8 | 린터 |
| `@typescript-eslint/eslint-plugin` | ^7 | TypeScript ESLint 플러그인 |
| `@typescript-eslint/parser` | ^7 | TypeScript ESLint 파서 |
| `prettier` | ^3 | 코드 포맷터 |

### 5-3. `.env.example`

```bash
# App
NODE_ENV=development
PORT=3000

# Database (PostgreSQL 16)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=pace
DB_PASSWORD=
DB_DATABASE=pace_db
# RDS 파라미터 그룹: timezone = Asia/Seoul
# TypeORM extra: { options: '-c TimeZone=Asia/Seoul' }
DB_TIMEZONE=Asia/Seoul

# JWT
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=30d

# Social Login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

KAKAO_REST_API_KEY=
KAKAO_CALLBACK_URL=

# FCM (firebase-admin)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=pace-assets
CLOUDFRONT_DOMAIN=

# Admin
ADMIN_JWT_SECRET=
```

---

## 6. 루트 설정 파일

### 6-1. `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 6-2. `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 6-3. `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## 7. 로컬 개발 환경 (`apps/api/docker-compose.yml`)

```yaml
version: "3.9"

services:
  db:
    image: postgres:16
    container_name: pace_postgres
    environment:
      POSTGRES_USER: pace
      POSTGRES_PASSWORD: pace_local_pw
      POSTGRES_DB: pace_db
      TZ: Asia/Seoul
      PGTZ: Asia/Seoul
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pace_api
    environment:
      NODE_ENV: development
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

> **KST 타임존 강제:** `TZ=Asia/Seoul`, `PGTZ=Asia/Seoul` 환경 변수를 PostgreSQL 컨테이너에 설정한다. RDS 환경에서는 파라미터 그룹 `timezone = Asia/Seoul`을 별도 설정한다.

---

## 8. 구현 착수 순서 (이인수 구현 기준)

`backend.md` 6절의 순서를 구체화한다.

| 순서 | 작업 | 선행 조건 |
|---|---|---|
| 1 | `apps/api` NestJS 프로젝트 초기화 (`nest new api`) | pnpm + Turborepo 루트 설정 완료 |
| 2 | TypeORM + PostgreSQL 연결. `database.config.ts` 작성 | Docker Compose로 로컬 PostgreSQL 실행 |
| 3 | ERD 기준 마이그레이션 파일 생성. `migrations/` 실행 | `planning/erd/PACE_ERD.md` 확정 버전 |
| 4 | `common/` 레이어 구현 (전역 필터, 인터셉터, 가드, 파이프) | — |
| 5 | Auth 모듈 — 이메일 회원가입/로그인, JWT, Refresh Token | common 레이어 완료 |
| 6 | Auth 모듈 — 소셜 로그인 (Google → Apple → Kakao 순) | 이메일 로그인 완료 |
| 7 | Onboarding 모듈 | Auth 완료 |
| 8 | Playlists 모듈 (시드 데이터 포함) | ERD 마이그레이션 완료 |
| 9 | Library 모듈 | Playlists 완료 |
| 10 | Play 모듈 — start/end/distraction | Playlists 완료 |
| 11 | Stats 모듈 — daily_stats UPSERT | Play 완료 |
| 12 | Review 모듈 | Play 완료 |
| 13 | Notifications 모듈 — FCM 서비스, 알림 설정, sync API | Firebase 설정 완료 |
| 14 | Upload 모듈 — S3 Pre-signed URL | AWS 자격증명 설정 |
| 15 | Jobs 모듈 — 배치 잡 순차 구현 | 관련 모듈 완료 후 |
| 16 | Admin 모듈 | 전체 모듈 완료 후 |
| 17 | Search 모듈 | Playlists 완료 |

---

## 9. 설계 결정 요약 (이명환 최종 결정 사항)

| 항목 | 결정 | 이유 |
|---|---|---|
| 레포 전략 | Turborepo Monorepo | API 타입 공유, 2인 팀 관리 비용 최소화 |
| 패키지 매니저 | pnpm | Turborepo 공식 권장, 디스크 효율 |
| 관리자 웹 레포 통합 | 동일 Monorepo (`apps/admin`) | shared-types 재사용, CI 단일화 |
| 백엔드 단일 레포 | API 서버 1개 (`apps/api`) | URL 프리픽스 `/admin/` + RolesGuard로 클라이언트 분리. 서버 분리 불필요 |
| Repository 레이어 분리 | 복잡 쿼리 모듈만 별도 생성 | MVP 단계 과도한 추상화 방지 |
| DB 타임존 | KST 고정 저장 | 서비스 지역 한국 단일. UTC 변환 레이어 불필요 (DR-009) |
| PostgreSQL 버전 | 16 | RDS PostgreSQL 16. MySQL에서 전환 확정 (PO 결정) |
| 실시간 통신 | MVP 미포함 | 타이머 클라이언트 로컬 동작. REST API로 충분 |
| Redis/캐싱 | MVP 미포함 | PostgreSQL 인덱스로 충분. 사용자 규모 증가 시 도입 |
