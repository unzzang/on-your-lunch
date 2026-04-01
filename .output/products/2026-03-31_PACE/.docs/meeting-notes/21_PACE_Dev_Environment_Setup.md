# 개발 환경 세팅 착수

> 일시: 2026-03-18
> 참석: PO(사용자), 위더(AI 시니어 기획자), 이명환(백엔드 아키텍트), 이인수(백엔드 개발자), 잭(프론트엔드 리드)

---

## 논의 배경

ERD·마이그레이션·기술 스펙이 모두 확정됨에 따라 실제 개발 환경 세팅 단계로 진입.
코드 레포는 기획 문서와 동일한 위치(`/Users/sadqueen/Documents/My_Projects/PACE/`)에 생성하기로 PO 확정.

---

## 결정 사항

### 1. 레포 전략 — Monorepo (Turborepo + pnpm)

| 항목 | 결정 |
|---|---|
| 레포 전략 | Monorepo (Turborepo) |
| 패키지 매니저 | pnpm |
| 근거 | 2인 구현 팀. `shared-types` 하나로 전 플랫폼 타입 공유. Polyrepo는 타입 드리프트 위험 |

### 2. 전체 프로젝트 구조

```
/Users/sadqueen/Documents/My_Projects/PACE/
├── .docs/              ← 기획 회의록
├── planning/           ← 기능 명세, ERD, 기술 스펙
├── design/             ← .pen 디자인 파일
├── decision-making/    ← DR 의사결정 기록
│
├── apps/               ← 코드 (신규)
│   ├── api/            ← NestJS 백엔드
│   ├── mobile/         ← React Native (Expo)
│   ├── web/            ← Next.js 15 PC 웹
│   └── admin/          ← Next.js 관리자 웹 (톰 하디)
│
└── packages/           ← 공유 코드 (신규)
    ├── shared-types/   ← API 타입, 도메인 모델
    ├── shared-utils/   ← 타이머, 집중률, 망각 곡선 (순수 함수)
    └── design-tokens/  ← 색상, 타이포, 간격
```

### 3. 상태관리 — Zustand

> 타이머(1초 업데이트) 스토어 성능 제어에 유리. Jotai도 검토했으나 Zustand의 명시적 스토어 단위 구독이 60fps 유지에 적합. Redux Toolkit은 현 규모에서 오버엔지니어링.

### 4. 백엔드 모듈 13개 확정

`auth` / `users` / `onboarding` / `playlists` / `library` / `play` / `stats` / `review` / `notifications` / `search` / `upload` / `admin` / `jobs`

---

## 스캐폴딩 진행 현황

### apps/api/ (NestJS 백엔드) — 완료 ✓

| 항목 | 내용 |
|---|---|
| 담당 | 이인수 |
| 프레임워크 | NestJS CLI v11 (`--skip-git`으로 루트 git 저장소 충돌 방지) |
| 설치 패키지 | `@nestjs/typeorm` + `typeorm` + `pg` (PostgreSQL 16), `@nestjs/config`, `@nestjs/jwt` + `passport-jwt`, `class-validator`, `@nestjs/schedule` |
| 디렉토리 구조 | 13개 모듈 디렉토리 + `common/` + `config/` 생성 완료 |
| 환경변수 | `.env.example` 생성 (DB, JWT, Firebase 항목 포함) |
| 빌드 확인 | `nest build` 오류 없이 통과 |

### apps/mobile/ (React Native Expo) — 완료 ✓

| 항목 | 내용 |
|---|---|
| 담당 | 잭 |
| 템플릿 | `blank-typescript` |
| 핵심 패키지 | `expo-router`, `expo-notifications`, `expo-secure-store`, `zustand`, `@tanstack/react-query`, `axios`, `dayjs` |
| 주요 파일 | `app/` 라우팅 구조, `stores/` (timerStore, playerStore, authStore), `lib/api.ts` (axios + 토큰 자동주입), `lib/notifications.ts` |
| 비고 | `--legacy-peer-deps` 필요 (expo-router 피어 디펜던시 충돌, 런타임 영향 없음) |

### apps/web/ (Next.js 15 PC 웹) — 완료 ✓

| 항목 | 내용 |
|---|---|
| 담당 | 잭 |
| 설정 | TypeScript + Tailwind + ESLint + App Router + src-dir |
| 핵심 패키지 | `zustand`, `@tanstack/react-query`, `axios`, `dayjs` |
| 주요 파일 | `(auth)/`, `(main)/` 라우트 그룹, `now-playing/` 전체화면 집중 모드 |

### 모노레포 루트 — 완료 ✓

| 파일 | 내용 |
|---|---|
| `pnpm-workspace.yaml` | apps/*, packages/* 워크스페이스 선언 |
| `turbo.json` | build / dev / lint / test 파이프라인 정의 |
| `tsconfig.base.json` | 전체 TypeScript strict 기본 설정 |
| `package.json` | 루트 스크립트 (`dev:api`, `dev:mobile`, `dev:web`, `build`) |

---

## 생성된 기술 문서

| 파일 | 내용 |
|---|---|
| `planning/tech-spec/project-structure.md` | 전체 모노레포 구조 및 백엔드 모듈 설계 (580줄) |
| `planning/tech-spec/frontend-structure.md` | 프론트엔드 디렉토리 구조 상세 (466줄) |
| `planning/tech-spec/infrastructure-cost.md` | AWS 인프라 비용 산출 (MVP ~$49/월) |

---

## 미결 사항

- [ ] packages/ 공유 패키지 초기화 (shared-types, shared-utils, design-tokens)
- [ ] 관리자 웹 (apps/admin/) 세팅 — 톰 하디
- [ ] AppModule 기본 설정 (TypeORM + ConfigModule 연결) — 이인수
- [ ] (tabs)/_layout.tsx 탭 네비게이터 구성 — 잭

---

## Action Items

- [x] **이명환**: 레포 전략 및 전체 프로젝트 구조 설계
- [x] **잭**: 프론트엔드 디렉토리 구조 설계 + Expo/Next.js 스캐폴딩 완료
- [x] **이인수**: NestJS 백엔드 스캐폴딩 완료
- [x] **위더**: 모노레포 루트 파일 생성 (pnpm-workspace.yaml, turbo.json, tsconfig.base.json, package.json)
