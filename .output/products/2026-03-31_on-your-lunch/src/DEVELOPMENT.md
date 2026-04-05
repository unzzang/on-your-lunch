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
| **React Native** | 모바일 앱을 만드는 프레임워크 | 건축 설계 도면 |
| **Expo** | React Native를 쉽게 쓰게 해주는 도구 세트 | 건축 시공 업체 |
| **Turborepo** | 3개 코드 묶음을 한꺼번에 관리하는 도구 | 3개 공장을 총괄하는 관리소 |

### React Native vs Expo vs 시뮬레이터

이 세 가지를 혼동하기 쉽습니다. 정리하면:

```
React Native (앱 코드를 작성하는 프레임워크)
    ↓
Expo (빌드 + 실행 + 배포를 자동화하는 도구)
    ↓
시뮬레이터 (완성된 앱을 PC에서 테스트하는 가상 기기)
```

- **React Native** = "모바일 앱을 JavaScript/TypeScript로 작성"할 수 있게 해주는 프레임워크
- **Expo** = React Native 프로젝트를 셋업·빌드·배포하는 과정을 간소화. `npx expo start` 한 줄이면 앱이 실행됨. Expo 없이 하려면 Xcode, Android Studio 설정을 직접 해야 함.
- **시뮬레이터** = 앱을 테스트하는 가상 기기. Expo가 시뮬레이터에 앱을 띄워줌.

**백엔드로 비유하면:**
```
NestJS 없이 Node.js만으로 서버 → Express 직접 설정, 라우팅 직접 구현...
NestJS 사용              → nest new 한 줄이면 서버 완성

Expo 없이 React Native만으로 앱 → Xcode/Android Studio 직접 설정...
Expo 사용                   → npx expo start 한 줄이면 앱 실행
```

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

## 프론트엔드 구조 이해하기 (백엔드 개발자를 위한 가이드)

백엔드를 알고 있다면, 프론트엔드도 대응 관계로 이해할 수 있습니다.

### 백엔드 vs 프론트엔드 대응 관계

| 백엔드 (NestJS) | 프론트엔드 (Expo) | 하는 일 |
|-----------------|-------------------|---------|
| `controller.ts` | `app/(tabs)/explore.tsx` | 백엔드: 요청을 받는 곳 / 프론트: **화면을 보여주는 곳** |
| `service.ts` | `services/hooks/useRestaurant.ts` | 백엔드: 비즈니스 로직 / 프론트: **API 호출 + 결과 캐싱** |
| `prisma.service.ts` | `services/api.ts` | 백엔드: DB 연결 / 프론트: **서버 연결** |
| `app.module.ts` | `app/_layout.tsx` | 백엔드: 모듈 등록 / 프론트: **전체를 감싸는 틀** |
| (해당 없음) | `stores/filterStore.ts` | 프론트에만 있음: **화면 상태 저장** (어떤 필터를 선택했는지 등) |
| (해당 없음) | `components/RestaurantCard.tsx` | 프론트에만 있음: **재사용 가능한 UI 부품** |

### 폴더 구조와 역할

```
apps/mobile/
├── app/                    ← 화면 (파일 1개 = 화면 1개)
│   │
│   ├── _layout.tsx         ← 모든 화면을 감싸는 틀
│   │                         (QueryClient, 인증 체크, SafeArea 등)
│   │
│   ├── (auth)/             ← 로그인 전에만 보이는 화면 그룹
│   │   ├── login.tsx       ← 스플래시 + Google 로그인 버튼
│   │   └── terms.tsx       ← 약관 동의 체크박스
│   │
│   ├── (onboarding)/       ← 처음 가입할 때만 거치는 화면 그룹
│   │   ├── location.tsx    ← Step 1: 회사 위치 설정
│   │   ├── preference.tsx  ← Step 2: 좋아하는 음식 + 가격대
│   │   └── exclusion.tsx   ← Step 3: 알레르기 + 싫어하는 음식
│   │
│   ├── (tabs)/             ← 메인 화면 (하단 탭 바)
│   │   ├── _layout.tsx     ← 탭 바 설정 (홈/탐색/이력/마이)
│   │   ├── index.tsx       ← 홈 (오늘의 추천 카드 3장)
│   │   ├── explore.tsx     ← 탐색 (식당 검색 + 리스트)
│   │   ├── history.tsx     ← 먹은 이력 (캘린더)
│   │   └── mypage.tsx      ← 마이페이지
│   │
│   ├── restaurant/
│   │   └── [id].tsx        ← 식당 상세 ([id]는 동적 경로, /restaurant/abc123)
│   │
│   └── mypage/             ← 마이페이지 하위 화면
│       ├── edit-profile.tsx
│       ├── notification.tsx
│       └── withdraw.tsx
│
├── services/               ← API 호출 코드
│   │
│   ├── api.ts              ← HTTP 클라이언트 (서버와 통신하는 파이프)
│   │                         - Base URL: http://localhost:3000/v1
│   │                         - JWT 토큰 자동 첨부
│   │                         - 401 에러 시 토큰 자동 갱신
│   │
│   └── hooks/              ← API 호출 함수 모음
│       ├── useRecommendations.ts  ← GET /recommendations/today 호출
│       ├── useRestaurant.ts       ← GET /restaurants/:id 등 호출
│       ├── useEatingHistory.ts    ← 먹은 이력 관련 API
│       └── useUser.ts             ← 사용자 정보 관련 API
│
├── stores/                 ← 클라이언트 상태 저장소
│   │
│   │   서버에서 가져온 데이터는 여기 저장하지 않음!
│   │   서버 데이터 = TanStack Query가 관리
│   │   여기는 "앱 안에서만 쓰는 상태"만 저장
│   │
│   ├── authStore.ts        ← 로그인했는지, JWT 토큰
│   ├── filterStore.ts      ← 지금 어떤 필터를 선택했는지
│   ├── onboardingStore.ts  ← 온보딩 몇 단계까지 했는지
│   └── exploreStore.ts     ← 지도 뷰인지 리스트 뷰인지
│
├── components/             ← 재사용 UI 부품
│   │
│   │   여러 화면에서 똑같이 쓰는 UI를 여기에 한 번 만들고 재사용.
│   │   백엔드에서 공통 유틸 함수를 만드는 것과 같은 개념.
│   │
│   ├── RestaurantCard.tsx  ← 식당 카드 (홈 추천, 탐색 리스트에서 재사용)
│   ├── CategoryChips.tsx   ← 카테고리 칩 (홈, 탐색에서 재사용)
│   ├── SkeletonCard.tsx    ← 로딩 스켈레톤 (여러 화면에서 재사용)
│   ├── EmptyState.tsx      ← 빈 상태 안내 (여러 화면에서 재사용)
│   └── ErrorState.tsx      ← 에러 상태 안내 (여러 화면에서 재사용)
│
└── constants/              ← 상수
    └── tokens.ts           ← 디자인 토큰 (색상, 폰트, 간격)
```

### 데이터가 흐르는 순서

**백엔드:**
```
클라이언트 요청 → Controller → Service → Prisma → DB → 응답
```

**프론트엔드:**
```
사용자가 화면 터치
    ↓
화면 (app/explore.tsx)
    ↓ "식당 목록 가져와"
Hook (services/hooks/useRestaurant.ts)
    ↓ HTTP GET /v1/restaurants
API 클라이언트 (services/api.ts)
    ↓ 서버에 요청
백엔드 → DB → 응답
    ↓
TanStack Query가 결과를 캐싱
    ↓
화면에 데이터 표시
```

**필터를 바꿀 때:**
```
사용자가 "한식" 칩 터치
    ↓
Store (stores/filterStore.ts) 업데이트
    ↓
화면이 자동으로 re-render
    ↓
Hook이 새 필터로 API 재호출
    ↓
새 결과가 화면에 표시
```

### 핵심 개념: "서버 상태"와 "클라이언트 상태"를 분리

| 종류 | 관리하는 곳 | 예시 |
|------|------------|------|
| **서버 상태** | TanStack Query | 추천 목록, 식당 상세, 먹은 이력, 사용자 프로필 |
| **클라이언트 상태** | Zustand Store | 선택한 필터, 로그인 여부, 뷰 모드 |

이 둘을 섞지 않는 것이 핵심입니다. 서버 데이터를 Store에 복사하면 "서버에는 업데이트됐는데 Store에는 옛날 데이터"같은 버그가 생깁니다.

---

## Phase 5: 프론트엔드 세팅

> **목표:** Expo 프로젝트 생성 + 화면 구조 잡기 + 앱 실행 확인
> **비유:** 건물의 2동(앱)을 짓고, 전기를 켜는 것.
> **담당:** 잭도슨 (프론트엔드 리드)

### 왜 Expo?

React Native로 모바일 앱을 만들 때, Xcode(iOS)와 Android Studio를 직접 설정하면 복잡합니다. Expo는 이 과정을 자동화해줍니다. `npx expo start`만 치면 앱이 실행됩니다.

### 진행 순서

#### 5-1. Expo 프로젝트 생성

`apps/mobile/`에 Expo 프로젝트를 생성합니다.

#### 5-2. 화면 구조 (expo-router 파일 기반)

expo-router는 **파일 이름 = 화면 경로**입니다. `app/mypage.tsx` 파일을 만들면 `/mypage` 경로가 자동으로 생깁니다.

```
app/
├── _layout.tsx              ← 루트 레이아웃 (모든 화면을 감쌈)
├── (auth)/                  ← 인증 전 화면 그룹
│   ├── login.tsx            ← 스플래시 + Google 로그인
│   └── terms.tsx            ← 약관 동의
├── (onboarding)/            ← 온보딩 그룹
│   ├── location.tsx         ← Step 1: 회사 위치
│   ├── preference.tsx       ← Step 2: 취향 + 가격대
│   └── exclusion.tsx        ← Step 3: 제외 설정
├── (tabs)/                  ← 메인 탭 (하단 탭 바)
│   ├── _layout.tsx          ← 탭 레이아웃 (홈/탐색/이력/마이)
│   ├── index.tsx            ← 홈 (오늘의 추천)
│   ├── explore.tsx          ← 탐색 (지도/리스트)
│   ├── history.tsx          ← 먹은 이력 (캘린더)
│   └── mypage.tsx           ← 마이페이지
├── restaurant/[id].tsx      ← 식당 상세 (동적 경로)
├── record/[restaurantId].tsx ← 먹었어요 기록
└── mypage/                  ← 마이페이지 하위
    ├── edit-profile.tsx
    ├── edit-location.tsx
    ├── edit-preference.tsx
    ├── notification.tsx
    └── withdraw.tsx
```

괄호 폴더 `(auth)`, `(tabs)` 등은 URL에 포함되지 않는 "그룹"입니다. `(tabs)/index.tsx`의 실제 경로는 `/`이지 `/tabs/`가 아닙니다.

#### 5-3. 디자인 토큰 상수

디자인 시스템의 색상, 폰트, 간격을 TypeScript 상수로 정의합니다.

```
constants/tokens.ts  ← Primary #D4501F, 카테고리 색상 7개 등
```

#### 5-4. Zustand 스토어

클라이언트 상태(앱 내에서만 쓰는 데이터)를 관리하는 저장소 4개:

| 스토어 | 역할 |
|--------|------|
| authStore | JWT 토큰, 로그인 상태 |
| onboardingStore | 온보딩 진행 단계 |
| filterStore | 카테고리/가격대/도보 거리 필터 |
| exploreStore | 지도/리스트 뷰 모드 |

서버 데이터(추천 목록, 식당 정보 등)는 TanStack Query가 관리. Zustand에 복제하지 않음.

#### 5-5. API 클라이언트

백엔드 API를 호출하는 코드:
- `services/api.ts` — HTTP 클라이언트 (ky) + 토큰 자동 주입 + 401 시 자동 갱신
- `services/hooks/` — TanStack Query 커스텀 훅 (useRecommendations, useRestaurant 등)

#### 5-6. 실행 확인

```bash
pnpm mobile:start
```

Expo Go 앱이나 시뮬레이터에서 앱이 뜨면 성공.

### Phase 5 완료 후 확인

- `pnpm mobile:start`로 Expo 개발 서버가 뜸
- 앱이 시뮬레이터/Expo Go에서 실행됨
- 하단 탭 바가 보이고, 탭 전환이 동작함
- 빈 화면이지만 구조(레이아웃)는 잡혀있는 상태

---

## Phase 6: 프론트엔드 UI 구현

> **목표:** 디자인 명세를 보고 실제 화면을 만든다.
> **비유:** 2동에 인테리어(UI)를 하는 것. 벽지, 가구, 조명을 하나씩 배치.
> **담당:** 잭도슨 (프론트엔드 리드)

### Phase 5와 뭐가 다른가요?

- **Phase 5** = 빈 방을 만든 것 (벽과 문만 있는 상태)
- **Phase 6** = 방에 가구를 배치하는 것 (실제 UI 구현)

Phase 5에서 각 화면 파일에 "화면 제목"만 표시했다면, Phase 6에서는 디자인 명세서를 보고 실제 카드, 버튼, 리스트, 캘린더를 구현합니다.

### 구현 순서

#### 6-1. 공용 컴포넌트 (여러 화면에서 재사용)
- RestaurantCard — 식당 카드 (홈 추천, 탐색 리스트)
- CategoryChips — 카테고리 칩 가로 스크롤
- SkeletonCard — 로딩 스켈레톤
- EmptyState — 빈 상태 안내
- ErrorState — 에러 상태 안내

#### 6-2. 인증 화면 (로그인, 약관)
#### 6-3. 온보딩 화면 (위치, 취향, 제외)
#### 6-4. 홈 화면 (추천 카드 3장 + 필터)
#### 6-5. 탐색 화면 (리스트/지도 + 검색)
#### 6-6. 먹은 이력 화면 (캘린더 + 기록 카드)
#### 6-7. 식당 상세 화면 (정보 + 먹었어요 바텀시트)
#### 6-8. 마이페이지 + 하위 화면

### 각 화면에 필수 구현할 것

모든 화면에 **4가지 상태**가 있어야 합니다:

| 상태 | 언제 | 표시 내용 |
|------|------|----------|
| **로딩** | API 호출 중 | 스켈레톤 (회색 막대가 반짝이는 애니메이션) |
| **정상** | 데이터 있음 | 실제 데이터 표시 |
| **빈 상태** | 데이터 없음 | "아직 기록이 없어요" 같은 안내 |
| **에러** | API 실패 | "인터넷 연결을 확인해주세요" + 재시도 버튼 |

### ⚠️ Phase 6 핵심 교훈: 시뮬레이터를 먼저 띄워라

Phase 6에서 가장 큰 실수는 **화면 20개를 한꺼번에 만들고 마지막에 시뮬레이터를 실행**한 것이다. 결과: 에러가 동시에 터지면서 원인을 찾기 어려웠다.

**향후 프로젝트에서는 반드시 이 순서를 따를 것:**

```
Phase 5 (세팅) 시점에서:
  1. 시뮬레이터를 먼저 실행 (npx expo start --ios --offline)
  2. _layout.tsx 최소 버전 → 빈 화면 확인
  3. 탭 바 추가 → 탭 전환 확인
  4. 이 상태에서 Phase 6 진입

Phase 6 (UI 구현) 시점에서:
  1. 공용 컴포넌트 1개 생성 → 시뮬레이터 확인
  2. 홈 화면 UI → 시뮬레이터 확인
  3. 탐색 화면 UI → 시뮬레이터 확인
  4. ... 한 화면씩, 매번 확인
```

**에이전트에게 위임할 때도:**
```
❌ "화면 20개 모두 만들어줘"
✅ "홈 화면 1개만 만들어줘. 시뮬레이터에서 확인 후 다음 화면."
```

이 규칙은 `rules/development/dev-rules.md`에도 추가되어 있음.

### Phase 6 완료 후 확인

- 모든 화면에 실제 UI가 구현됨 (빈 컴포넌트 아님)
- 4가지 상태(로딩/정상/빈/에러) 모두 구현
- 디자인 토큰(constants/tokens.ts)만 사용 (하드코딩 색상 없음)
- Zustand 스토어 + TanStack Query 훅 연동
- **시뮬레이터에서 모든 화면이 크래시 없이 표시됨** ← 이것이 진짜 완료 기준

---

## Phase 7: 연동 + 로컬 테스트

> **목표:** 프론트에서 백엔드 API를 호출하고, 실제 데이터가 화면에 표시되는지 확인.
> **비유:** 1동(서버)과 2동(앱)을 복도(API)로 연결하고, 물이 잘 흐르는지 테스트.
> **담당:** 잭도슨 (프론트) + 이인수 (백엔드) + 진도준 (QA)

### 왜 별도 Phase가 필요한가?

Phase 4에서 백엔드를 만들고, Phase 6에서 프론트를 만들었지만, 아직 **실제로 연결해본 적이 없습니다.** 각각 따로 동작하는 것과 함께 동작하는 것은 다릅니다.

### 테스트 항목

#### 7-1. 로컬 환경 실행 확인

백엔드와 프론트를 동시에 켜고, 통신이 되는지 확인:
```bash
# 터미널 1: 백엔드
pnpm api:dev

# 터미널 2: 프론트
pnpm mobile:start
```

#### 7-2. 핵심 플로우 통합 테스트

| 플로우 | 확인 내용 |
|--------|----------|
| 카테고리 조회 | GET /categories → 앱에 7개 카테고리 표시되는지 |
| 추천 조회 | GET /recommendations/today → 홈에 카드 3장 표시 |
| 식당 상세 | 카드 탭 → 상세 화면에 정보 표시 |
| 먹었어요 | 별점 입력 → POST /eating-histories → 이력에 반영 |
| 즐겨찾기 | 하트 탭 → POST /favorites/toggle → 상태 변경 |

#### 7-3. 에러 처리 확인

| 상황 | 확인 |
|------|------|
| 백엔드 꺼진 상태에서 앱 접속 | 에러 상태 화면 표시되는지 |
| 잘못된 토큰으로 요청 | 401 → 로그인 화면 이동 |

### Phase 7 완료 후 확인

- 프론트↔백엔드 API 통신 정상
- 핵심 플로우(추천→상세→기록)가 끊김 없이 동작
- 에러 상태가 올바르게 표시됨

---

## Phase 8: 배포 준비

> **목표:** 로컬에서 잘 되는 앱을 실제 서버와 앱스토어에 올릴 수 있도록 준비한다.
> **비유:** 완성된 건물에 준공 검사를 받고, 입주 안내문을 붙이는 것.
> **담당:** 이명환 (백엔드) + 잭도슨 (프론트)

### 만들 것

#### 8-1. 백엔드 배포 설정 (이명환)

- **Dockerfile** — Railway에 배포하기 위한 빌드 설정
- **railway.toml** — Railway 배포 옵션 (헬스체크, 재시작 정책)
- **콜드스타트 수집 스크립트** — 카카오 로컬 API로 강남 식당 데이터 수집

#### 8-2. 프론트엔드 배포 설정 (잭도슨)

- **eas.json** — EAS Build 설정 (개발/프리뷰/프로덕션 빌드)
- **app.json 보강** — 앱스토어 메타데이터 (아이콘, 스플래시, 버전)

### 크로스플랫폼 배포 — 코드 1개로 iOS + Android 동시 출시

React Native + Expo를 선택한 가장 큰 이유:

```
코드 1개 (React Native)
    ↓
Expo (EAS Build)
    ↓
├── iOS 빌드 (.ipa)     → Apple App Store 제출
└── Android 빌드 (.aab) → Google Play Store 제출
```

| 방식 | iOS | Android | 코드 | 비용 |
|------|:---:|:-------:|------|------|
| 네이티브 (Swift + Kotlin) | O | O | **2벌** 작성 | 2배 |
| React Native + Expo | O | O | **1벌**로 둘 다 | 1배 |

**배포 명령어:**
```bash
# iOS + Android 동시 빌드
npx eas build --platform all

# 각 스토어에 제출
npx eas submit --platform ios      # Apple App Store
npx eas submit --platform android   # Google Play Store
```

**필요한 계정 (배포 시점에 만들면 됨):**

| 계정 | 용도 | 비용 |
|------|------|------|
| Expo (expo.dev) | 앱 빌드 서비스 (EAS Build) | 무료 (월 30빌드) |
| Apple Developer | iOS 앱스토어 제출 | $99/년 |
| Google Play Developer | Android 스토어 제출 | $25 일회 |

로컬 개발에서는 이 계정들이 필요 없습니다. `--offline` 옵션으로 전부 우회 가능.

### Phase 8 완료 후 확인

- Dockerfile로 백엔드 이미지 빌드 가능
- eas.json으로 앱 빌드 가능
- 콜드스타트 스크립트 실행 가능 (카카오 API 키 필요)
- 실제 배포는 PO가 외부 서비스 계정/키를 발급한 후 진행 (inbox 문서 참조)

---

## Phase 9: 시뮬레이터 테스트 + 수정

> **목표:** 실제 iOS 시뮬레이터에서 앱을 띄우고, 백엔드 서버와 연동하여 화면이 올바르게 동작하는지 확인. 문제가 있으면 수정.
> **비유:** 건물을 다 지었으니, 실제로 들어가서 수도·전기·엘리베이터가 잘 되는지 입주 테스트.
> **담당:** PO (테스트) + 잭도슨 (프론트 수정) + 이인수 (백엔드 수정)

### 왜 이 단계가 필요한가?

코드를 작성하고 빌드가 되더라도, 실제 시뮬레이터에서 실행하면 예상치 못한 문제가 나올 수 있습니다:
- 화면 레이아웃이 깨짐
- API 호출이 실패
- 네비게이션(화면 전환)이 동작하지 않음
- 특정 기기에서 UI가 잘림

서버에 올리기 전에 로컬에서 이런 문제를 발견하고 수정하는 것이 훨씬 비용이 적습니다.

### 테스트 환경 준비

**필요한 것:**
- Mac + Xcode (iOS 시뮬레이터용)
- PostgreSQL 로컬 실행 중
- `onyourlunch` DB + 시드 데이터 (Phase 2에서 완료)

**실행 방법:**
```bash
# 터미널 1: 백엔드 서버
cd .output/products/2026-03-31_on-your-lunch/src
pnpm api:dev
# → http://localhost:3000/v1 에서 서버 실행

# 터미널 2: 프론트 앱
cd .output/products/2026-03-31_on-your-lunch/src/apps/mobile
npx expo start --ios --offline
# → iOS 시뮬레이터가 열리고, Expo Go에 앱이 로드됨
```

### Expo 실행 명령어 설명

```
npx expo start --ios --offline
```

이 명령어는 3가지를 합친 것입니다:

| 부분 | 하는 일 |
|------|---------|
| `npx expo start` | Expo 개발 서버를 켠다 (Metro Bundler). 코드를 번들링해서 앱에 전달하는 역할 |
| `--ios` | Xcode의 iOS 시뮬레이터를 자동으로 열고, 거기에 Expo Go 앱을 설치하고, 우리 앱을 로드 |
| `--offline` | Expo 서버에 로그인하지 않고 로컬에서만 실행. Expo 계정이 없어도 개발 가능 |

**시뮬레이터는 Xcode가 제공합니다. Expo가 설치하는 게 아닙니다.**

```
Xcode        → iOS 시뮬레이터 제공 (가상 iPhone)
Expo         → 시뮬레이터 안에 "Expo Go" 앱을 설치
Metro Bundler → 우리 코드를 번들링해서 Expo Go에 전달
Expo Go      → 번들을 받아서 화면에 표시
```

**다른 실행 옵션:**

| 명령어 | 실행 환경 |
|--------|----------|
| `npx expo start --ios` | iOS 시뮬레이터 (Xcode 필요) |
| `npx expo start --android` | Android 에뮬레이터 (Android Studio 필요) |
| `npx expo start` | QR 코드 표시 → 실제 기기의 Expo Go 앱으로 스캔 |
| `npx expo start --offline` | Expo 계정 로그인 없이 로컬 실행 |

### 테스트 체크리스트

#### 9-1. 앱 실행 확인
- [ ] Expo 개발 서버가 에러 없이 뜨는가
- [ ] iOS 시뮬레이터에서 앱이 열리는가
- [ ] 스플래시 화면이 표시되는가

#### 9-2. 인증 + 온보딩 플로우
- [ ] 로그인 화면이 표시되는가
- [ ] 약관 동의 → 체크박스 동작하는가
- [ ] 온보딩 3단계 화면 전환이 되는가
- [ ] 온보딩 완료 후 홈 화면으로 이동하는가

#### 9-3. 홈 화면 (핵심)
- [ ] 추천 카드 3장이 표시되는가 (서버에 식당 데이터가 있어야 함)
- [ ] 카테고리 칩 필터가 동작하는가
- [ ] 새로고침 버튼이 동작하는가
- [ ] 카드 탭 → 식당 상세로 이동하는가

#### 9-4. 탐색 화면
- [ ] 식당 리스트가 표시되는가
- [ ] 카테고리 필터가 동작하는가
- [ ] 무한 스크롤이 동작하는가

#### 9-5. 먹은 이력 화면
- [ ] 캘린더가 표시되는가
- [ ] 날짜 선택 시 기록이 표시되는가

#### 9-6. 마이페이지
- [ ] 프로필 정보가 표시되는가
- [ ] 설정 메뉴 탭이 동작하는가

### 발견된 버그 처리

1. PO가 버그를 발견하면 위더에게 보고
2. 위더가 해당 담당팀(잭도슨/이인수)에게 전달
3. 담당팀이 수정
4. PO가 재테스트

### Phase 9 테스트 기록

#### 시도 1: 시뮬레이터 실행 (2026-04-03)

**환경:** Mac + Xcode + iPhone 16 Pro 시뮬레이터 (iOS 18.6)

**실행 과정:**
```bash
# 1. 백엔드 서버 실행 (터미널 1)
cd src && pnpm api:dev
# → http://localhost:3000/v1 성공 확인

# 2. 프론트 앱 실행 (터미널 2)
cd src/apps/mobile && npx expo start --ios --offline
# → --offline: Expo 계정 로그인 없이 실행 (로컬 개발용)
```

**발견된 에러:**

| # | 에러 | 원인 | 수정 |
|---|------|------|------|
| 1 | `Unable to resolve asset "./assets/icon.png"` | app.json에서 참조하는 아이콘 파일이 실제로 없음 | 잭도슨이 placeholder 이미지 생성 또는 app.json 경로 수정 |
| 2 | `Objects are not valid as a React child` | 컴포넌트를 잘못된 방식으로 렌더링 (JSX에서 객체를 직접 표시) | 잭도슨이 _layout.tsx 등 확인 후 수정 |

**삽질 기록 (향후 방지):**

1. **Expo Go 버전 불일치** — 시뮬레이터와 실제 기기의 Expo Go 버전이 다를 수 있다.
   - **시뮬레이터**: `npx expo start --ios`가 프로젝트 SDK에 맞는 Expo Go를 자동 설치. 항상 호환됨.
   - **실제 기기(iPhone)**: App Store에서 설치한 Expo Go는 특정 SDK까지만 지원. 프로젝트 SDK가 더 높으면 "project is incompatible" 에러 발생.
   - **해결**: 실제 기기의 Expo Go 앱 → Settings에서 **Supported SDK 버전 확인** → 프로젝트 SDK를 그 버전에 맞출 것.
   - **향후 방지**: 프론트엔드 세팅(Phase 5) 시 **실제 기기 Expo Go의 SDK 버전을 먼저 확인**하고 그에 맞춰 프로젝트 SDK를 설정할 것.

2. **Expo 계정 로그인 에러** — `ApiV2Error: Your username, email, or password was incorrect.` 발생 시 `--offline` 옵션으로 우회. 로컬 개발에서는 Expo 계정이 필수가 아님. Expo 계정은 앱스토어 배포 시에만 필요.

3. **CLI에서 시뮬레이터 제어 한계** — `npx expo start`는 인터랙티브 입력(Y/N 확인)이 필요한데, Claude Code CLI에서는 불가능. PO가 직접 터미널에서 실행하거나, `--offline` 같은 옵션으로 우회.

#### 시도 2: 에러 수정 후 재실행

**에러 1: 아이콘 파일 누락**
```
Unable to resolve asset "./assets/icon.png" from "icon" in your app.json
```
- **원인:** app.json에서 `./assets/icon.png` 등을 참조하는데, 실제 파일이 없었음
- **수정:** `assets/` 폴더에 placeholder PNG 4개 생성 (icon.png, splash-icon.png, adaptive-icon.png, favicon.png)
- **향후 방지:** Expo 프로젝트 세팅 시 app.json에 참조하는 asset 파일을 반드시 함께 생성할 것

**에러 2: React 렌더링 에러 — "Objects are not valid as a React child"**
```
Objects are not valid as a React child (found: object with keys {$$typeof, type, key, props, _owner, _store})
```
- **원인 3가지:**
  1. `app/index.tsx` 파일이 없었음 → expo-router가 앱 진입점을 찾지 못해 에러
  2. `SafeAreaProvider`가 루트 레이아웃에 없었음 → `SafeAreaView`를 사용하는 화면들이 에러
  3. `(auth)/`와 `(onboarding)/` 그룹에 `_layout.tsx`가 없었음 → 그룹 라우팅 실패
- **수정:**
  - `app/index.tsx` 생성 — 인증 상태에 따라 (tabs) 또는 (auth)/login으로 리다이렉트
  - `app/_layout.tsx` 수정 — `SafeAreaProvider` 추가, `index` Screen 등록
  - `app/(auth)/_layout.tsx` 생성 — Stack 레이아웃
  - `app/(onboarding)/_layout.tsx` 생성 — Stack 레이아웃
- **향후 방지:**
  - expo-router 프로젝트에서 **반드시 `app/index.tsx`** 필요 (루트 진입점)
  - 괄호 그룹 `(auth)/`, `(onboarding)/`에는 **반드시 `_layout.tsx`** 필요
  - `SafeAreaView`를 사용하면 루트에 `SafeAreaProvider`가 있어야 함
  - `<Stack>` 안에는 `<Stack.Screen>`만 넣을 것. `<StatusBar>` 같은 컴포넌트는 Stack 바깥에

#### 근본 원인: "실행하지 않고 코드를 만들면 안 된다"

**왜 시뮬레이터에서 에러가 폭발하는가?**

```
파일 50개 한꺼번에 생성 → 마지막에 실행 → 에러 50개 동시 발생
```

에이전트가 코드를 작성할 때 TypeScript 문법은 맞지만, **실제 런타임 동작은 확인하지 않았다.** 빌드가 되는 것과 실행이 되는 것은 다르다.

| 코드 레벨에서 OK | 실행하면 에러 |
|-----------------|-------------|
| `<StatusBar />` 문법 맞음 | Stack 안에 넣으면 expo-router가 거부 |
| `assets/icon.png` 경로 문법 맞음 | 실제 파일이 없으면 크래시 |
| `app/index.tsx` 없어도 빌드 됨 | expo-router가 진입점 못 찾아 크래시 |
| `SafeAreaView` 사용 문법 맞음 | SafeAreaProvider 없으면 크래시 |

**올바른 프론트엔드 개발 방식 (향후 프로젝트 필수):**

```
올바른 방식:
  1. _layout.tsx만 생성 → 시뮬레이터에서 빈 화면 뜨는지 확인
  2. (tabs)/_layout.tsx + index.tsx 추가 → 탭 바 뜨는지 확인
  3. 홈 화면에 UI 추가 → 화면 표시 확인
  4. API 연동 추가 → 데이터 표시 확인
  5. 한 화면씩 추가하면서 매번 실행 확인

잘못된 방식 (현재):
  파일 50개 한꺼번에 에이전트에게 위임 → 마지막에 실행 → 에러 폭발
```

백엔드에서는 모듈별로 잘 나눠서 진행했지만, 프론트에서는 한꺼번에 위임해버렸다. **프론트엔드는 "눈에 보이는" 결과물이므로 반드시 매 단계마다 시뮬레이터에서 확인해야 한다.**

#### 시도 3: 최소 코드로 재시작

에러를 하나씩 잡는 것보다, **최소한의 코드로 시뮬레이터에서 동작하는 상태를 먼저 만들고**, 거기서부터 화면을 하나씩 추가하는 방식으로 전환.

1. 모든 화면을 최소화 (빈 View + Text만)
2. `_layout.tsx`를 가장 단순한 형태로
3. 시뮬레이터에서 탭 바가 뜨는 것까지 확인
4. 그 다음에 화면을 하나씩 복원하면서 매번 확인

#### 시도 3: 완전 삭제 후 재시작 — 성공!

`apps/mobile/` 하위를 전부 삭제하고, 빈 폴더에서 처음부터 시뮬레이터 확인하며 진행.

**근본 원인 발견:** `metro.config.js`가 없었다!

pnpm workspace 모노레포에서는 node_modules가 워크스페이스 루트(`src/`)에 hoisted되어 있는데, Metro Bundler는 기본적으로 프로젝트 디렉토리(`src/apps/mobile/`)의 node_modules만 탐색한다. 이로 인해 expo-router 내부 모듈 해석이 실패하고, ErrorOverlay 자체에서 2차 에러가 발생하여 원래 에러가 가려졌다.

**해결:** `metro.config.js` 생성
```javascript
// metro.config.js — pnpm workspace 모노레포 필수 설정
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// workspace 루트를 감시 대상에 추가
config.watchFolders = [workspaceRoot];

// 모듈 해석 시 workspace 루트 node_modules도 탐색
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
```

**이 파일이 없으면:** Metro가 의존성을 못 찾아서 앱이 크래시.
**이 파일이 있으면:** pnpm workspace 루트의 node_modules를 올바르게 참조.

**향후 방지:** pnpm workspace + Expo 프로젝트에서는 **반드시 `metro.config.js`를 생성**하고 `watchFolders`와 `nodeModulesPaths`에 workspace 루트를 추가할 것. 이것은 `dev-rules.md`의 프론트엔드 규칙에 추가해야 할 항목.

**추가 수정:**
- `babel.config.js` 생성 — `@/` 경로 별칭을 위한 `babel-plugin-module-resolver` 설정
- `assets/` 디렉토리 생성 — placeholder PNG (icon, splash, adaptive-icon)

**최종 결과:** iOS 시뮬레이터에서 홈 화면 정상 표시 확인. 카테고리 칩, 서브 필터, 추천 카드, 하단 탭 바 모두 동작.

### Phase 9 완료 후 확인

- 앱이 시뮬레이터에서 크래시 없이 동작
- 핵심 플로우(로그인→추천→상세→기록)가 끊김 없이 동작
- 모든 탭 전환이 정상
- 에러 상태(서버 꺼짐 등)에서 앱이 크래시하지 않음

---

## Phase 10: 프론트↔백엔드 API 연동

> **목표:** 모든 화면에서 MOCK/하드코딩 데이터를 제거하고 실제 백엔드 API와 연결한다.
> **비유:** 건물(프론트)과 수도관(백엔드)을 연결하는 것. Phase 5~9에서 건물은 지었지만, 수도꼭지에서 물이 안 나오는 상태였다.

### 왜 별도 Phase인가?

Phase 5~9에서 프론트엔드 화면을 만들 때 MOCK 데이터로 UI를 먼저 구현했다. 이유는:
- 백엔드가 완성되기 전에 프론트 작업을 시작할 수 있다
- UI 레이아웃을 빠르게 확인할 수 있다

하지만 **MOCK 데이터를 실제 API로 교체하는 단계를 건너뛰면** "화면은 보이는데 데이터가 가짜"인 상태가 된다. 이것이 온유어런치에서 실제로 발생한 문제다.

### 연동 체크리스트 (화면 단위)

모든 화면을 아래 기준으로 점검한다. **한 줄이라도 MOCK이면 미완료.**

| 화면 | 사용 API | 필요한 훅 | 확인 |
|------|---------|---------|:---:|
| 홈 탭 | GET /recommendations/today, POST /recommendations/today/refresh | useRecommendations, useRefreshRecommendation | ✅ |
| 탐색 탭 | GET /restaurants, GET /categories | useRestaurants, useCategories | ✅ |
| 이력 탭 | GET /eating-histories/calendar | useEatingHistoryCalendar | ✅ |
| 마이 탭 | GET /users/me | useMe | ✅ |
| 식당 상세 | GET /restaurants/{id} | useRestaurant | ✅ |
| 기록 저장 | POST /eating-histories | useCreateEatingHistory | ✅ |
| 즐겨찾기 | POST /favorites/toggle | useFavoriteToggle | ✅ |
| 프로필 편집 | PATCH /users/me/profile | useUpdateProfile | ✅ |
| 위치 변경 | PUT /users/me/location | useUpdateLocation | ✅ |
| 취향 수정 | PUT /users/me/preferences | useUpdatePreferences | ✅ |
| 알림 설정 | PUT /users/me/notification | useUpdateNotification | ✅ |
| 회원 탈퇴 | DELETE /users/me | useDeleteAccount | ✅ |
| 추천 새로고침 | POST /recommendations/today/refresh | useRefreshRecommendation | ✅ |

### MOCK 데이터 잔류 검사 방법

```bash
# 프론트엔드 코드에서 MOCK 데이터 검색
grep -rn "MOCK_" apps/mobile/app/ --include="*.tsx" --include="*.ts"
grep -rn "하드코딩" apps/mobile/app/ --include="*.tsx" --include="*.ts"

# 결과가 0건이어야 통과
```

### 디자인 대조 검수

화면별로 디자인 명세와 시뮬레이터를 나란히 비교한다.

| 화면 | 디자인 명세 | 대조 결과 |
|------|-----------|----------|
| 홈 탭 | `docs/005_design/home.md` | |
| 탐색 탭 | `docs/005_design/explore.md` | |
| 이력 탭 | `docs/005_design/history.md` | |
| 마이 탭 | `docs/005_design/mypage.md` | |
| 식당 상세 | `docs/005_design/restaurant-detail.md` | |
| 온보딩 | `docs/005_design/onboarding.md` | |

각 화면에서 확인:
- [ ] 레이아웃(배치, 간격)이 디자인과 일치
- [ ] 색상/타이포가 토큰과 일치
- [ ] 컴포넌트 스타일이 component-spec과 일치
- [ ] 4가지 상태가 디자인에 맞게 구현

### Phase 10 완료 후 확인

- [ ] 모든 화면에서 MOCK 데이터가 제거되었는가
- [ ] 백엔드 API 응답과 shared-types 타입이 일치하는가
- [ ] 모든 화면에 에러/로딩/빈 상태가 구현되어 있는가
- [ ] `react-native-gesture-handler`의 ScrollView를 사용하지 않는가 (FlatList 또는 react-native ScrollView만 사용)
- [ ] 시뮬레이터에서 모든 탭 전환이 정상인가
- [ ] 시뮬레이터에서 모든 화면에 실제 데이터가 표시되는가
- [ ] 디자인 대조 검수 통과 (불일치 0건 또는 수정 완료)

### 이 Phase에서 배운 것 (삽질 방지)

1. **ScrollView 충돌** — `GestureHandlerRootView` 안에서 `react-native-gesture-handler`의 `ScrollView`를 쓰면 스크롤이 안 됨. 반드시 `react-native`의 `ScrollView` 또는 `FlatList`를 사용할 것.

2. **API 응답 래퍼** — 모든 API가 `{ success: true, data: {...} }` 형태로 응답함. 프론트에서 `response.data`가 아니라 `response.data.data`처럼 한 단계 더 들어가야 할 수 있음. ky의 `.json<ApiResponse<T>>()` 후 `result.data`로 접근.

3. **dev-login 토큰 문제** — 앱 시작 시 백엔드가 꺼져 있으면 dev-login 실패 → 토큰 없이 홈 진입 → 모든 API 401. "다시 시도" 버튼에서 dev-login 재시도 로직 필요.

---

## Phase 11: QA (품질 검증)

> **목표:** 앱의 모든 기능이 기능 명세서대로 동작하는지 검증한다.
> **비유:** 건물이 다 지어졌으니, 안전 검사를 받는 것.

### QA 4단계 (건너뛰기 금지)

QA는 반드시 아래 4단계를 순서대로 진행한다. 한 단계라도 실패하면 수정 후 해당 단계부터 재검증.

#### Phase 11-1. 정적 검증

코드 자체의 오류를 검사한다. 앱을 실행하지 않고도 확인 가능.

```bash
# 1. TypeScript 타입 체크
npx tsc --project apps/mobile/tsconfig.json --noEmit

# 2. 백엔드 빌드
pnpm api:build

# 3. 린트
pnpm lint

# 4. shared-types 빌드
npx tsc --project packages/shared-types/tsconfig.json --noEmit
```

**통과 기준:** 에러 0건

#### Phase 11-2. 통합 검증

프론트↔백엔드 연결이 올바른지 확인한다.

```bash
# 1. 백엔드 서버 실행
pnpm api:dev

# 2. 모든 API 엔드포인트 호출 테스트
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/dev-login \
  -H "Content-Type: application/json" | python3 -c \
  "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

# 3. 각 API 정상 응답 확인
curl -s http://localhost:3000/v1/categories -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:3000/v1/users/me -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:3000/v1/restaurants?page=1 -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:3000/v1/recommendations/today -H "Authorization: Bearer $TOKEN"
curl -s "http://localhost:3000/v1/eating-histories/calendar?year=2026&month=4" -H "Authorization: Bearer $TOKEN"
```

**통과 기준:** 모든 API가 `{ success: true }` 반환

#### Phase 11-3. 기능 검증 (시뮬레이터)

시뮬레이터에서 핵심 플로우를 실제로 테스트한다.

**핵심 플로우 체크리스트:**

| # | 플로우 | 확인 사항 |
|---|--------|---------|
| 1 | 앱 시작 → 홈 | dev-login 자동 → 추천 3곳 표시 |
| 2 | 추천 새로고침 | "다른 추천 보기" 탭 → 새 식당 표시, 횟수 증가 |
| 3 | 식당 상세 | 카드 탭 → 상세 화면 (이름, 카테고리, 도보, 설명) |
| 4 | 먹었어요 | 상세 → "먹었어요" → 별점/메모 → 저장 성공 |
| 5 | 즐겨찾기 | 하트 탭 → 토글 동작 |
| 6 | 탐색 탭 | 식당 목록 표시, 카테고리 필터 동작 |
| 7 | 이력 탭 | 캘린더 표시, 날짜 선택 → 기록 표시 |
| 8 | 마이 탭 | 닉네임/이메일 표시, 설정 메뉴 진입 |
| 9 | 탭 간 이동 | 모든 탭 전환 정상, 뒤로 가기 정상 |
| 10 | 에러 상태 | 서버 끄고 → "다시 시도" 동작 |

#### Phase 11-4. 수정 재검증

Phase 11-3에서 발견된 버그를 수정한 후, 해당 기능만 재검증.

- 수정 전: 버그 재현 확인 (스크린샷)
- 수정 후: 동일 시나리오 통과 확인 (스크린샷)
- 리그레션: 수정이 다른 기능에 영향을 주지 않았는지 확인

### QA 판정 기준

| 판정 | 조건 |
|------|------|
| **통과** | 상 0건 + 중 0건 |
| **조건부 통과** | 상 0건 + 중 3건 이하 |
| **실패** | 상 1건 이상, 또는 중 4건 이상 |

### 이슈 심각도 기준

| 심각도 | 기준 | 예시 |
|--------|------|------|
| **상** | 핵심 기능 불가 | 앱 크래시, 로그인 불가, 추천 표시 안 됨 |
| **중** | 기능 동작하나 불완전 | 스크롤 안 됨, 데이터 불일치, 에러 상태 미처리 |
| **하** | 개선하면 좋은 수준 | UI 정렬, 로딩 속도, 폰트 미세 차이 |

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
5. **코드 작성은 개발팀이 수행** — 기획(위더)이 직접 코드를 쓰지 않음
6. **MOCK 데이터는 반드시 제거** — Phase 10에서 모든 화면의 MOCK/하드코딩 데이터를 실제 API로 교체. 한 줄이라도 남아있으면 미완료
7. **API 훅 대조 필수** — 백엔드 API 목록 vs 프론트 훅 목록을 1:1 대조. 누락된 훅이 있으면 생성
8. **ScrollView는 react-native에서 import** — react-native-gesture-handler의 ScrollView 사용 금지. FlatList 권장

---

## 참고: 백엔드 없이 서비스 만들기

향후 유지보수 비용을 줄이고 싶다면, 백엔드를 직접 만들지 않고 **BaaS(Backend as a Service)**를 사용하는 방법이 있습니다.

### BaaS란?

백엔드에 필요한 기능(DB, 인증, 파일 저장, 푸시 알림)을 서비스 업체가 제공합니다. 서버 코드를 작성하지 않아도 됩니다.

```
자체 백엔드 방식 (온유어런치):
  프론트 → 우리가 만든 NestJS 서버 → 우리가 관리하는 DB
  → 서버 유지보수 필요 (버그 수정, 서버 관리, 비용)

BaaS 방식:
  프론트 → Firebase/Supabase (구글/업체가 관리) → 업체가 관리하는 DB
  → 서버 유지보수 불필요
```

### 선택지

| 방법 | 설명 | 유지보수 비용 | 적합한 경우 |
|------|------|-------------|-----------|
| **React Native + Firebase** | 구글의 BaaS. DB(Firestore), 인증, 파일 저장, 푸시를 서버 없이 제공 | 거의 없음 | 간단한 앱, CRUD 위주 |
| **React Native + Supabase** | Firebase의 오픈소스 대안. PostgreSQL 기반이라 SQL 사용 가능 | 거의 없음 | SQL을 쓰고 싶을 때 |
| **Next.js (웹앱)** | React 기반 웹앱. 서버 기능(API Routes)이 내장되어 별도 백엔드 불필요 | 낮음 | 모바일 앱이 필요 없고 웹만 필요할 때 |

### 언제 자체 백엔드가 필요한가?

| 상황 | BaaS로 충분? | 이유 |
|------|:-----------:|------|
| 게시판, 메모 앱, 일기 앱 | ✅ | 단순 CRUD |
| 채팅, 알림 | ✅ | Firebase가 실시간 기능 제공 |
| 추천 알고리즘 (온유어런치) | ❌ | 복잡한 서버 로직이 필요 |
| PostGIS 거리 계산 | ❌ | DB 확장 기능이 필요 |
| 결제 연동 | ❌ | 보안상 서버 처리 필수 |

**결론:** 단순한 서비스는 **React Native + Firebase**로 백엔드 없이 빠르게 만들 수 있습니다. 복잡한 비즈니스 로직이 필요하면 자체 백엔드(NestJS 등)가 필요합니다.
