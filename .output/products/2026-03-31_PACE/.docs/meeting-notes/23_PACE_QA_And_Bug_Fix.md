# 23. PACE QA 검증 및 버그 수정 완료

> 일시: 2026-03-18
> 참석: PO, 위더(Wither), 이명환(myunghwan), 이인수(insoo), 잭(jack), 진도준(dojun)
> 목적: 전체 구현 코드 검증, Jest 테스트, QA 버그 수정

---

## 1. 코드 검증 단계

### 1-1. Jest 테스트 결과 (수정 전)

| 영역 | 파일 | 테스트 수 | 결과 |
|---|---|---|---|
| 백엔드 | review.service.spec.ts, stats.service.spec.ts | 26개 | ✅ 전부 통과 |
| 프론트엔드 | timerStore.spec.ts, authStore.spec.ts | 21개 | ✅ 전부 통과 |

**TypeScript 컴파일 이슈 수정:**
- `apps/api/package.json` — `@pace/shared-utils: "workspace:*"` 의존성 추가
- `apps/api/tsconfig.json` — `paths`에 `@pace/shared-utils` 매핑 추가
- `packages/shared-utils/package.json` — `exports` 필드 추가

### 1-2. 이명환 아키텍처 코드 리뷰 결과

| 심각도 | 건수 |
|---|---|
| 🔴 Critical | 5건 |
| 🟡 Warning | 7건 |
| 🟢 Info | 4건 |

**즉시 처리된 Critical 이슈:**

| # | 내용 | 처리 |
|---|---|---|
| 1 | 소셜 토큰 미검증 — 누구든 로그인 가능 | production에서 UnauthorizedException, dev 환경만 mock 허용 |
| 2 | logout 멱등성 불일치 | 토큰 없어도 조용히 성공 처리 |
| 3 | main.ts 보안 기본 설정 전무 | ValidationPipe + Helmet + CORS 적용 |
| 4 | RTR 이중 무효화 | `refreshByToken()`이 직접 처리, 이중 호출 경로 제거 |
| 5 | createReviewSchedules 트랜잭션 없음 | DataSource 트랜잭션으로 묶음, 실패 시 전체 롤백 |

---

## 2. 인프라 보완

### V5 마이그레이션 (이명환)
파일: `planning/erd/migrations/V5__add_missing_constraints.sql`

| 제약명 | 테이블 | 컬럼 |
|---|---|---|
| `uq_user_playlists_user_playlist_type` | user_playlists | (user_id, playlist_id, type) |
| `uq_review_schedules_user_session_interval` | review_schedules | (user_id, session_id, interval_days) |

### 추가 개선
- `common/utils/date.util.ts` 생성 — KST 날짜 계산 유틸 통합 (3개 서비스 중복 제거)
- `user-playlist.entity.ts` — `@Unique` 데코레이터 추가
- `pnpm install` 루트 실행 완료 — shared-types/utils 심링크 생성

---

## 3. QA 검증 (진도준)

### 3-1. 테스트 추가 (+15개)

| 파일 | 추가 전 | 추가 후 |
|---|---|---|
| review.service.spec.ts | 11개 | 16개 |
| stats.service.spec.ts | 13개 | 17개 |
| timerStore.spec.ts | 12개 | 18개 |

### 3-2. QA 문서 산출물

- `planning/qa/error-scenarios.md` — 7개 영역, 22개 에러 케이스 시나리오
- `planning/qa/bug-report.md` — 8개 버그 리포트

---

## 4. 버그 수정 전체 결과

| 버그 | 심각도 | 내용 | 처리자 |
|---|---|---|---|
| BUG-001 | Minor | Home useEffect deps 누락 → useCallback + deps 명시 | 잭 |
| BUG-002 | Major | completePlayLog 중복 완료 → ConflictException | 이인수 |
| BUG-003 | Minor | 복습 재완료/재건너뜀 방어 → ConflictException | 이인수 |
| BUG-004 | Major | timerStore persist 미적용 → AsyncStorage persist 적용 | 잭 |
| BUG-005 | Minor | iOS 전화 수신 오탈출 → 5초 미만 이탈 무시 | 잭 |
| BUG-006 | Minor | 복습 날짜 KST 오차 → addDaysToKstDate() 유틸 | 이인수 |
| BUG-007 | Minor | 과목 분석 동일 title 중복 집계 → session_id 우선 GROUP BY | 이인수 |
| BUG-008 | Major | strict 모드 복귀 시 자동 재개 미구현 → resumeTimer() 자동 호출 | 잭 |

### 정책 결정 (BUG-008)
> **"strict 모드에서 앱으로 돌아오면 타이머 자동 재개"** — PO 확정 (2026-03-18)

---

## 5. 최종 테스트 현황

| 파일 | 테스트 수 |
|---|---|
| apps/api/src/review/review.service.spec.ts | 16개 |
| apps/api/src/stats/stats.service.spec.ts | 17개 |
| apps/api/src/app.controller.spec.ts | 1개 |
| apps/mobile/stores/timerStore.spec.ts | 18개 |
| apps/mobile/stores/authStore.spec.ts | 8개 |
| **합계** | **60개 전부 통과** |

---

## 6. 남은 작업 (추후 스프린트)

| 항목 | 내용 |
|---|---|
| Apple/Google OAuth 실제 연결 | expo-apple-authentication, expo-auth-session |
| FCM firebase-admin 연동 | firebase-admin 설치 후 sendNotification 구현 |
| daily_stats (user_id, date) UK — V4 적용 전 중복 행 확인 | 운영 DB 적용 전 사전 확인 필요 |
| CORS_ORIGIN 환경변수 설정 | 프로덕션 배포 전 필수 |
| 관리자 웹 (apps/admin/) | 기획 완료 후 진행 |
| Redis 캐싱 (JwtStrategy) | DAU 증가 후 선제적 도입 검토 |
