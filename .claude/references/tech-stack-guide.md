# 기술 스택 가이드

> 새 프로젝트 시작 시 참고. Stage 2 Gate 3 (기술 설계) 전에 반드시 읽는다.

---

## 권장 스택 (2026-04-07 확정)

```
Next.js 15+ (App Router)
├── app/          ← 프론트 페이지
├── app/api/      ← 백엔드 API Routes (Route Handlers)
├── lib/          ← Supabase Client, 유틸
└── components/   ← UI 컴포넌트

Supabase
├── PostgreSQL    ← 데이터베이스
├── Auth          ← Google OAuth 등 소셜 로그인
├── Storage       ← 이미지 업로드 (필요 시)
└── Realtime      ← 실시간 기능 (필요 시)

Vercel
└── 1개 프로젝트   ← git push만 하면 자동 배포

Capacitor
└── iOS/Android   ← 네이티브 앱 래핑 (필요 시)
```

## 왜 이 스택인가

### NestJS 별도 백엔드를 쓰지 않는 이유

온유어런치 프로젝트(2026-04)에서 NestJS + Vercel 배포 시 발생한 문제:

| 문제 | 상세 |
|------|------|
| Serverless 변환 | NestJS → Vercel Serverless 진입점 변환, 모노레포 의존성 해결에 추가 작업 多 |
| Cold Start | NestJS 초기화에 3~5초 소요 |
| 번들 크기 | NestJS + Prisma가 Vercel 50MB 제한에 근접 |
| 프로젝트 분리 | 프론트/백엔드 2개 Vercel 프로젝트 → 배포 복잡도 증가 |
| 타입 동기화 | shared-types 별도 패키지 필요 → API 경로 불일치 반복 |
| 배포 삽질 | node_modules 업로드, Deployment Protection, link 충돌 등 |

### Next.js API Routes로 통합하면

| 항목 | NestJS 별도 | Next.js API Routes |
|------|:---------:|:-----------------:|
| Vercel 프로젝트 수 | 2개 | **1개** |
| 배포 | Serverless 변환 필요 | **자동** |
| Cold Start | 3~5초 | **~1초** |
| 타입 공유 | shared-types 패키지 | **같은 프로젝트 내** |
| API 경로 관리 | 프론트/백엔드 각각 | **한 곳에서 관리** |
| 인증 | JWT 직접 구현 | **Supabase Auth** |

## 배포 구성

```
GitHub (1개 레포)
    ↓ git push
Vercel (1개 프로젝트, 자동 배포)
    ↓ 연결
Supabase (DB + Auth)
```

## Supabase 사용 시 Prisma vs Supabase Client

| | Prisma | Supabase Client |
|---|--------|----------------|
| 타입 안전성 | 스키마에서 자동 생성 | supabase-js 타입 자동 생성 |
| 마이그레이션 | Prisma Migrate | Supabase Migrations |
| 실시간 | 지원 안 함 | Realtime 내장 |
| 권장 | 복잡한 쿼리, ORM 선호 시 | **기본 권장** (Supabase 생태계 활용) |

## 모바일 앱 (Capacitor)

- Next.js 앱을 Capacitor로 iOS/Android 래핑
- Vercel 프로덕션 URL을 `capacitor.config.ts`의 `server.url`로 연결
- 카카오 지도 등 외부 SDK 사용 시 도메인 등록 필요:
  - Vercel 프로덕션 URL
  - `capacitor://localhost` (iOS)
  - `http://localhost` (Android)

## 배포 전 체크리스트

- [ ] `.vercelignore` 설정 (node_modules 업로드 방지)
- [ ] Vercel Deployment Protection 비활성화 (또는 의도적 활성화)
- [ ] 프로덕션 환경변수 설정 (Vercel 대시보드)
- [ ] 프로덕션 테스트용 로그인 수단 준비
- [ ] GitHub 연동 자동 배포 설정
- [ ] Supabase 프로젝트 생성 + DB 마이그레이션
