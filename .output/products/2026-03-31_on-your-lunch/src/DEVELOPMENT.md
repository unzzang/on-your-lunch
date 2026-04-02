# 온유어런치 개발 가이드

이 문서를 순서대로 따라하면 온유어런치 앱의 개발 환경을 세팅하고, 백엔드와 프론트엔드를 완성할 수 있습니다.

**대상:** 개발이 처음이거나 익숙하지 않은 분
**소요 시간:** 각 Phase별 1~2시간
**사전 준비:** Mac, 터미널(Terminal.app), VS Code

---

## 시작 전 알아야 할 것

### 이 프로젝트의 구조

온유어런치는 **3개의 코드 묶음**으로 이루어져 있습니다.

```
src/
├── apps/
│   ├── api/           ← 백엔드: 서버. 데이터를 저장하고, 요청에 응답한다.
│   └── mobile/        ← 프론트엔드: 앱 화면. 사용자가 보고 터치하는 부분.
└── packages/
    └── shared-types/  ← 공유 타입: 백엔드와 프론트가 "이 데이터는 이런 모양이야"라고 약속하는 문서.
```

**왜 이렇게 나누나요?**
- 백엔드와 프론트엔드는 하는 일이 다릅니다. 서버와 앱을 한 파일에 섞으면 관리가 불가능합니다.
- 하지만 둘이 데이터를 주고받으려면 "식당 정보는 이름, 카테고리, 가격이 있어"라는 약속이 필요합니다. 그게 shared-types입니다.

### 도구 설명

| 도구 | 역할 | 비유 |
|------|------|------|
| **Node.js** | JavaScript를 실행하는 엔진 | 자동차의 엔진 |
| **pnpm** | 패키지(라이브러리)를 설치하는 도구 | 앱스토어. 필요한 부품을 다운받는 곳 |
| **NestJS** | 백엔드 프레임워크. 서버를 만드는 뼈대 | 건물의 철골 구조 |
| **Prisma** | 데이터베이스와 대화하는 도구 | 도서관 사서. "이 책 찾아줘"라고 하면 찾아줌 |
| **PostgreSQL** | 데이터베이스. 데이터를 저장하는 창고 | 도서관 서고 |
| **Expo** | 모바일 앱을 만드는 도구 | 앱 공장 |
| **Turborepo** | 3개 코드 묶음을 한꺼번에 관리하는 도구 | 3개 공장을 총괄하는 관리소 |

---

## Phase 1: 프로젝트 뼈대 만들기

> **목표:** 3개 코드 묶음이 하나의 프로젝트로 연결되는 기반을 만든다.
> **비유:** 빈 땅에 건물 3동의 터를 닦고, 공용 주차장(node_modules)을 만드는 것.

### 1-1. 루트 설정 파일 만들기

`src/` 폴더 안에 4개의 설정 파일을 만듭니다. 각 파일이 하는 일을 설명합니다.

#### package.json — "이 프로젝트의 신분증"

모든 Node.js 프로젝트에는 `package.json`이 있습니다. 프로젝트 이름, 버전, 그리고 "이 명령어를 치면 이걸 해라"라는 스크립트를 적어둡니다.

```json
// src/package.json
{
  "name": "on-your-lunch",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "api:dev": "turbo run dev --filter=@on-your-lunch/api",
    "api:build": "turbo run build --filter=@on-your-lunch/api",
    "mobile:start": "turbo run start --filter=@on-your-lunch/mobile",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:generate": "cd apps/api && npx prisma generate",
    "db:migrate": "cd apps/api && npx prisma migrate dev",
    "db:seed": "cd apps/api && npx prisma db seed"
  }
}
```

- `"private": true` → 이 프로젝트는 npm에 공개하지 않겠다는 뜻
- `"scripts"` → 터미널에서 `pnpm api:dev`를 치면 백엔드 서버가 켜짐
- `--filter=@on-your-lunch/api` → "api 폴더만 실행해"라는 뜻

#### pnpm-workspace.yaml — "우리 팀원은 이 폴더들이야"

pnpm에게 "이 프로젝트에는 apps/ 아래, packages/ 아래에 코드 묶음이 있어"라고 알려주는 파일입니다.

```yaml
# src/pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

이 2줄이면 pnpm이 `apps/api`, `apps/mobile`, `packages/shared-types`를 하나의 팀으로 인식합니다.

#### turbo.json — "빌드할 때 이 순서로 해"

Turborepo에게 "build를 하려면 먼저 의존하는 것부터 빌드해"라고 알려주는 파일입니다.

```json
// src/turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

- `"dependsOn": ["^build"]` → shared-types를 먼저 빌드한 뒤에 api, mobile을 빌드
- `"persistent": true` → dev 서버처럼 계속 실행되는 명령어

#### .npmrc — "패키지를 한 곳에만 설치해"

```
# src/.npmrc
shamefully-hoist=true
```

이 한 줄이 하는 일: 모든 패키지(라이브러리)를 `src/node_modules/` 한 곳에만 설치합니다. `apps/api/node_modules/`, `apps/mobile/node_modules/` 같은 중복 폴더가 생기지 않습니다.

#### 확인

만든 뒤 `src/` 폴더 구조:
```
src/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── .npmrc
```

### 1-2. .gitignore + .prettierrc 만들기

#### .gitignore — "이 파일들은 git에 올리지 마"

```
# src/.gitignore
node_modules/
dist/
.env
.env.*
!.env.example
.turbo/
*.tsbuildinfo
```

- `node_modules/` → 설치한 패키지는 git에 올리지 않음 (용량이 수백MB)
- `dist/` → 빌드 결과물도 올리지 않음
- `.env` → 비밀번호, API 키 등 민감 정보가 들어가므로 절대 올리지 않음
- `!.env.example` → 단, .env의 템플릿은 올림 (어떤 키가 필요한지 알려주려고)

#### .prettierrc — "코드를 이 스타일로 정렬해"

```json
// src/.prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

이 파일이 있으면 팀원 모두가 같은 코드 스타일을 씁니다. 들여쓰기 2칸, 작은따옴표(''), 줄 끝에 세미콜론(;).

#### 확인

```
src/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .npmrc
├── .gitignore
└── .prettierrc
```

### 1-3. 폴더 구조 만들기 + pnpm install

아직 코드는 없지만, 빈 폴더를 먼저 만듭니다.

```bash
cd src
mkdir -p apps/api
mkdir -p apps/mobile
mkdir -p packages/shared-types
```

그 뒤 `pnpm install`을 실행합니다. 아직 의존성이 없으므로 금방 끝납니다.

```bash
pnpm install
```

성공하면 `src/node_modules/` 폴더가 생깁니다. 이것이 유일한 node_modules입니다.

#### Phase 1 완료 확인

```
src/
├── node_modules/          ← pnpm이 생성 (유일한 패키지 저장소)
├── apps/
│   ├── api/               ← 아직 비어있음
│   └── mobile/            ← 아직 비어있음
├── packages/
│   └── shared-types/      ← 아직 비어있음
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .npmrc
├── .gitignore
└── .prettierrc
```

이 상태가 **프로젝트의 빈 뼈대**입니다. 다음 Phase에서 여기에 살을 붙여갑니다.

---

## Phase 2: Prisma + DB 세팅

> **목표:** 데이터베이스 구조를 먼저 잡는다. enum도 여기서 정의한다.
> **비유:** 건물을 짓기 전에 땅(DB)을 다지고, 설계도(schema)를 등록하는 것.

### 왜 DB부터 하나요?

가격대(`PriceRange`), 에러코드(`ErrorCode`) 같은 enum을 TypeScript 파일에 직접 쓸 수도 있지만, **Prisma schema에서 정의하면**:

1. **DB가 잘못된 값을 막아줌** — `price_range` 컬럼에 `UNDER_10K`, `BETWEEN_10K_20K`, `OVER_20K`만 들어갈 수 있음. 오타나 다른 값은 DB가 거부.
2. **TypeScript 타입 자동 생성** — `prisma generate`를 실행하면 Prisma가 enum과 모델 타입을 자동으로 만들어줌. 직접 안 써도 됨.
3. **한 곳에서 관리** — enum을 바꾸려면 schema.prisma 하나만 수정 → 마이그레이션 → 끝.

ERD 문서(`docs/004_planning/erd/2026-03-30(일)_ERD.md`)에 14개 테이블이 정의되어 있습니다. 이걸 Prisma schema로 옮기는 작업입니다.

### 진행 순서

#### 2-1. Prisma 설치

apps/api에 Prisma를 설치하고, 초기 설정 파일을 생성합니다.

#### 2-2. schema.prisma — enum 정의

여러 테이블에서 공통으로 쓰는 값을 enum으로 정의합니다:
- `PriceRange`: 가격대 (1만원 이하 / 1~2만원 / 2만원 이상)
- `DataSource`: 식당 데이터 출처 (카카오 / 수동 / 사용자 입력)

#### 2-3. schema.prisma — 테이블(모델) 정의

ERD 문서를 보면서 14개 테이블을 하나씩 Prisma 모델로 작성합니다:
- User, UserLocation (사용자 + 회사 위치)
- Category, AllergyType (마스터 데이터)
- Restaurant, RestaurantMenu, RestaurantPhoto (식당)
- EatingHistory, Favorite (이력 + 즐겨찾기)
- RecommendationLog, RecommendationLogItem (추천 기록)
- 등등...

#### 2-4. PostgreSQL 로컬 DB 생성

로컬에 `onyourlunch` 데이터베이스를 만들고, .env 파일에 연결 정보를 설정합니다.

#### 2-5. 마이그레이션 실행

`pnpm db:migrate`로 schema.prisma에 정의한 테이블을 실제 DB에 생성합니다.

#### 2-6. 시드 데이터 입력

카테고리 7건(한식, 중식, 일식...), 알레르기 6건(갑각류, 견과류...) 등 초기 데이터를 넣습니다.

### Phase 2 완료 후 확인

- PostgreSQL에 `onyourlunch` DB가 있고, 14개 테이블이 생성됨
- `pnpm db:studio`로 Prisma Studio를 열면 테이블과 시드 데이터가 보임
- Prisma가 TypeScript 타입을 자동 생성한 상태 (PriceRange enum 등)

### Prisma 7 주의사항 (삽질 방지)

Prisma 7은 이전 버전(v6)과 많이 다릅니다. 새 프로젝트 세팅 시 반드시 확인:

**1. Generator 설정**
```prisma
generator client {
  provider = "prisma-client"    // v7 (새 방식)
  output   = "../generated/prisma"
}
// prisma-client-js 는 v6 방식. v7에서도 동작하지만 어댑터 필수.
```

**2. PrismaClient 초기화 — 어댑터 필수**
```typescript
// v6 방식 (안 됨)
const prisma = new PrismaClient();

// v7 방식 (어댑터 전달 필수)
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```
- 패키지: `@prisma/adapter-pg` (v7용). `@prisma/pg-worker`는 v6용이므로 사용하지 말 것.

**3. Import 경로**
```typescript
// generated 폴더에서 직접 import
import { PrismaClient } from '../generated/prisma/client';
// enum도 마찬가지
import { PriceRange } from '../generated/prisma/client';
```

**4. DB 연결 설정**
- `prisma.config.ts`에서 `datasource.url`로 DB URL 설정
- seed.ts처럼 직접 실행하는 스크립트에서는 `dotenv`로 .env를 수동 로드 필요

**5. seed 설정 위치**
```typescript
// prisma.config.ts 안에 (package.json의 prisma.seed가 아님)
migrations: {
  seed: 'npx tsx prisma/seed.ts',
},
```

**6. NestJS에서 Prisma 7 사용 시**

`prisma-client` generator(ESM)는 NestJS(CommonJS)와 충돌합니다. 해결:
- generator를 `prisma-client-js`로 사용
- `@prisma/adapter-pg` 어댑터를 전달
- 타입이 안 맞으면 `as any` 캐스팅

```typescript
// prisma.service.ts — NestJS + Prisma 7 올바른 패턴
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    super({ adapter } as any);
  }
}
```

주의: `prisma-client` generator + `generated/prisma/client` 직접 import → ESM/CJS 충돌. 반드시 `prisma-client-js` + `@prisma/client` import.

**7. 필요한 패키지 정리**
```json
{
  "dependencies": {
    "@prisma/client": "^7.x",
    "@prisma/adapter-pg": "^7.x",
    "prisma": "^7.x",
    "dotenv": "^17.x"
  },
  "devDependencies": {
    "tsx": "^4.x"
  }
}
```

---

## Phase 3: 공유 타입 (shared-types) + 백엔드 세팅

> **목표:** Prisma가 만든 타입을 활용하여 API 요청/응답 타입을 정의하고, NestJS 서버를 세팅한다.
> **비유:** 설계도(schema)가 등록됐으니, 이제 건물 1동(서버)을 짓고 전기(포트 3000)를 켜는 것.

### 왜 shared-types와 백엔드를 같이 하나요?

Phase 2에서 Prisma가 만든 타입(PriceRange 등)이 있어야 shared-types의 API 응답 타입을 정의할 수 있습니다. 그리고 shared-types가 있어야 백엔드 API의 응답 형태를 맞출 수 있습니다. 순서가 연결되어 있어서 한 Phase에서 진행합니다.

### 진행 순서

#### 3-1. shared-types에 API 타입 정의

Prisma가 자동 생성한 enum을 re-export하고, API 스펙 문서를 보면서 요청/응답 interface를 작성합니다.

```
packages/shared-types/src/
├── index.ts              ← 모아서 내보내기
├── common.ts             ← 공용 응답 타입 (성공/에러 래퍼, 페이지네이션)
├── constants.ts          ← 공용 상수 (새로고침 5회, 별점 1~5 등)
├── auth.ts               ← 인증 API 타입
├── user.ts               ← 사용자 API 타입
├── restaurant.ts         ← 식당 API 타입
├── recommendation.ts     ← 추천 API 타입
├── eating-history.ts     ← 먹은 이력 API 타입
└── favorite.ts           ← 즐겨찾기 API 타입
```

#### 3-2. NestJS 프로젝트 세팅

apps/api에 NestJS를 설치하고, 기본 구조를 만듭니다.

**설치할 패키지:**
```bash
# NestJS 핵심 (dependencies)
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs --filter=@on-your-lunch/api

# 개발용 (devDependencies)
pnpm add typescript @nestjs/cli @types/node --filter=@on-your-lunch/api -D

# turbo도 루트에 필요
pnpm add turbo -D -w
```

**만들 파일:**

| 파일 | 역할 |
|------|------|
| `tsconfig.json` | TypeScript 설정. `rootDir: ./src`, `outDir: ./dist` |
| `nest-cli.json` | NestJS CLI 설정 |
| `src/main.ts` | 서버 시작점. 포트 3000에서 실행, `/v1` prefix |
| `src/app.module.ts` | 앱의 목차. 모듈을 등록하는 곳 |

**main.ts가 하는 일 (핵심 3줄):**
```typescript
const app = await NestFactory.create(AppModule);  // 앱 생성
app.setGlobalPrefix('v1');                          // /v1 prefix
await app.listen(3000);                             // 포트 3000에서 시작
```

**package.json에 추가할 스크립트:**
- `"dev": "nest start --watch"` — 개발 모드 (코드 바꾸면 자동 재시작)
- `"build": "nest build"` — 프로덕션 빌드
- `"start": "node dist/main"` — 빌드된 결과물 실행

#### 3-3. 서버 실행 확인

```bash
pnpm api:dev
```

성공하면 터미널에 이렇게 뜹니다:
```
서버가 http://localhost:3000 에서 실행 중입니다
API: http://localhost:3000/v1
```

`http://localhost:3000/v1`에 접속하면 `Cannot GET /v1`이 나오는데, 이건 정상입니다. 아직 API 엔드포인트를 안 만들었으니까요.

### Phase 3 완료 후 확인

- shared-types에 API 타입 파일 10개 있음 (enums, constants, common, auth, user, restaurant, recommendation, eating-history, favorite, event)
- 타입 체크 통과 (`npx tsc --project packages/shared-types/tsconfig.json --noEmit`)
- `pnpm api:dev`로 NestJS 서버가 포트 3000에서 뜸
- main.ts에 ValidationPipe + CORS 설정 완료
- 이 시점에 Swagger UI는 아직 없음 (Phase 4에서 추가)

### NestJS 세팅 주의사항 (삽질 방지)

1. **루트 package.json에 `packageManager` 필드 필수** — turbo가 이 필드를 요구함
   ```json
   "packageManager": "pnpm@10.32.1"
   ```

2. **turbo를 루트에 devDependency로 설치** — `pnpm add turbo -D -w`

3. **포트 충돌 시** — `lsof -ti:3000 | xargs kill -9`로 기존 프로세스 정리 후 재실행

---

## Phase 4: 백엔드 API 구현

> **목표:** 기능 명세서 하나당 API 하나씩 구현. 총 26개 엔드포인트.
> **비유:** 건물 1동에 방(API)을 하나씩 만드는 것. 인증 방, 추천 방, 식당 방...

### NestJS 모듈이란?

NestJS에서 기능 하나 = 모듈 하나입니다. 모듈은 3개 파일로 구성됩니다:

```
restaurant/
├── restaurant.module.ts      ← "이 모듈에 뭐가 있어" (목차)
├── restaurant.controller.ts  ← "이 URL로 요청이 오면 내가 받을게" (문 앞 안내원)
└── restaurant.service.ts     ← "실제 일은 내가 해" (실무 담당자)
```

**흐름:**
```
클라이언트 → Controller (요청 접수) → Service (비즈니스 로직) → Prisma (DB 조회) → 응답
```

### 구현 순서 (의존 관계 순)

먼저 다른 모듈이 공통으로 쓰는 것부터, 그 다음 핵심 기능, 마지막으로 부가 기능.

#### 4-1. Prisma 서비스 모듈

모든 모듈이 DB를 쓰려면 PrismaClient가 필요합니다. 이걸 NestJS 서비스로 감싸서 어디서든 주입(inject)받을 수 있게 합니다.

```
apps/api/src/prisma/
├── prisma.module.ts    ← PrismaService를 다른 모듈에 제공
└── prisma.service.ts   ← PrismaClient를 감싼 NestJS 서비스
```

#### 4-2. 공통 모듈 (응답 래퍼, 에러 필터)

API 스펙의 공통 응답 형식 `{ success: true, data: ... }`을 자동으로 만들어주는 인터셉터, 그리고 에러를 `{ success: false, error: { code, message } }` 형식으로 변환하는 필터.

```
apps/api/src/common/
├── interceptors/response.interceptor.ts  ← 응답을 { success, data }로 자동 래핑
├── filters/http-exception.filter.ts      ← 에러를 { success, error }로 변환
└── decorators/current-user.decorator.ts  ← 인증된 사용자 정보를 쉽게 꺼내는 데코레이터
```

#### 4-3. 카테고리 모듈 (가장 간단한 API)

가장 단순한 CRUD부터 시작. GET /categories, GET /allergy-types. 인증도 필요 없고, 로직도 "전체 조회"뿐.

#### 4-4. 인증 모듈 (Auth)

Google OAuth 로그인, JWT 발급/갱신/로그아웃. 다른 모듈이 "이 사용자는 누구야?"를 알려면 Auth가 먼저 있어야 합니다.

#### 4-5. 사용자 모듈 (User)

프로필, 위치 설정, 취향 설정, 온보딩 완료, 알림, 탈퇴.

#### 4-6. 식당 모듈 (Restaurant)

식당 상세, 검색, 리스트, 지도 핀.

#### 4-7. 추천 모듈 (Recommendation)

핵심 기능! 5단계 필터링 + 4단계 조건 완화 알고리즘. 가장 복잡한 모듈.

#### 4-8. 먹은 이력 모듈 (EatingHistory)

먹었어요 기록, 직접 입력, 수정, 삭제, 캘린더 조회.

#### 4-9. 즐겨찾기 모듈 (Favorite)

토글 방식. 간단.

#### 4-10. 공유 모듈 (Share)

딥링크 리다이렉트. 간단.

#### 4-11. 알림 모듈 (Notification)

푸시 알림 스케줄링 (node-cron).

#### 4-12. 이벤트 모듈 (Event)

데이터 분석용 이벤트 로그. 간단.

### Phase 4 완료 후 확인

- 모든 26개 엔드포인트가 동작함
- Swagger UI(`http://localhost:3000/api-docs`)에서 API를 직접 테스트 가능
- shared-types와 실제 응답 형태가 일치함

### Phase 4 구현 결과 (2026-04-02)

**구현 담당:** 이인수 (백엔드 개발자)
**코드 리뷰:** 이명환 (백엔드 아키텍트)

| 모듈 | 엔드포인트 | 파일 |
|------|-----------|------|
| 카테고리 | GET /categories, GET /allergy-types | src/category/ |
| 인증 | POST /auth/google, /refresh, /logout | src/auth/ |
| 사용자 | GET/PUT/PATCH/DELETE /users/me/* (8개) | src/user/ |
| 식당 | GET /restaurants, /search, /map, /:id | src/restaurant/ |
| 추천 | GET /recommendations/today, POST /refresh | src/recommendation/ |
| 먹은 이력 | POST/PATCH/DELETE /eating-histories, GET /calendar | src/eating-history/ |
| 즐겨찾기 | POST /favorites/toggle | src/favorite/ |
| 공유 | GET /share/restaurant/:id | src/share/ |
| 알림 | 스케줄러 (Cron, 매 30분) | src/notification/ |
| 이벤트 | POST /events | src/event/ |

**검증 결과:** 조건부 통과 (상 0건, 중 2건, 하 7건)
- 중: 식당 검색/탐색 API의 totalCount 페이지네이션 불일치 → 병행 수정 예정

### Phase 4 주의사항 (삽질 방지)

1. **코드 작성은 반드시 개발팀이 수행** — 위더(기획)가 직접 코드를 쓰면 NestJS 컨벤션, Prisma 7 사용법 등에서 문제 발생. 기획은 "무엇을 만들지" 설명하고, "어떻게 만들지"는 개발팀에 위임.

2. **전역 JWT Guard + @Public() 패턴** — NestJS에서 인증을 전역으로 적용하고, 인증 불필요한 엔드포인트만 @Public()으로 면제. 개별 Guard를 매번 붙이는 것보다 안전.

3. **ResponseInterceptor + GlobalExceptionFilter** — main.ts에서 전역 등록. 모든 응답이 `{ success, data }` 또는 `{ success, error }` 형태로 자동 변환됨.

---

## Phase 5: 프론트엔드 세팅

> **목표:** Expo 프로젝트 생성 + 화면 구조 잡기 + 앱 실행 확인
> **비유:** 건물의 2동(앱)을 짓고, 전기를 켜는 것.

(Phase 5 진입 시 상세 작성)

---

## Phase 6: 프론트엔드 UI 구현

> **목표:** 디자인 명세를 보고 실제 화면을 만든다. 총 20개 화면.
> **비유:** 2동에 인테리어(UI)를 하는 것. 벽지, 가구, 조명을 하나씩 배치.

(Phase 6 진입 시 상세 작성)

---

## Phase 7: 연동 + 로컬 테스트

> **목표:** 프론트에서 백엔드 API를 호출하고, 실제 데이터가 화면에 표시되는지 확인.
> **비유:** 1동(서버)과 2동(앱)을 복도(API)로 연결하고, 물이 잘 흐르는지 테스트.

(Phase 7 진입 시 상세 작성)

---

## Phase 8: 배포 준비

> **목표:** 로컬에서 잘 되는 앱을 실제 서버와 앱스토어에 올린다.
> **비유:** 완성된 건물을 입주자(사용자)에게 오픈하는 것.

(Phase 8 진입 시 상세 작성)

---

## 참조 문서

| 문서 | 위치 | 내용 |
|------|------|------|
| API 스펙 | `docs/004_planning/tech-spec/2026-03-30(일)_api-spec.md` | 26개 API 목록 + 요청/응답 형태 |
| ERD | `docs/004_planning/erd/2026-03-30(일)_ERD.md` | 14개 DB 테이블 구조 |
| 백엔드 기술 스펙 | `docs/004_planning/tech-spec/2026-03-30(일)_backend.md` | 기술 선택 근거 |
| 프론트 기술 스펙 | `docs/004_planning/tech-spec/2026-03-30(일)_frontend.md` | 기술 선택 근거 |
| 기능 명세 5건 | `docs/004_planning/specs/` | 각 기능의 동작 규칙 |
| 디자인 명세 6건 | `docs/005_design/` | 각 화면의 디자인 상세 |
| 디자인 프리뷰 | `design/` | HTML+CSS 미리보기 6개 |

## 규칙

1. **Prisma(DB) 먼저** → shared-types → 백엔드 → 프론트 순서로 진행
2. **node_modules는 src/ 에만** — 하위 폴더에 설치하지 않음
3. **각 Phase 완료 후 PO 확인** — 동작을 직접 확인한 뒤 다음으로
4. **한 번에 하나씩** — 파일 하나를 만들고, 왜 필요한지 이해하고, 다음으로
