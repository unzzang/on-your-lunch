# 22. PACE 핵심 모듈 전체 구현 완료

> 일시: 2026-03-18
> 참석: PO, 위더(Wither), 이인수(insoo), 잭(jack), 이명환(myunghwan)
> 목적: auth~review 전 모듈 구현 진행 및 완료 보고

---

## 1. 진행 배경

지난 회의(21번)에서 개발 환경 세팅(Monorepo, NestJS, Expo, 공유 패키지)이 완료된 후, auth → onboarding → home → search까지 1차 구현이 끝난 상태였다. 이번 회의에서는 library부터 review까지 나머지 전체 모듈을 완료하는 것을 목표로 진행했다.

---

## 2. 완료된 모듈

### 2-1. Library (보관함)

**백엔드 (이인수)**
- `user_playlists` 엔티티 재활용
- `GET /api/v1/library` (filter: all/saved/created), `GET /api/v1/library/recent`
- `POST /api/v1/library/:playlistId` (저장), `DELETE /api/v1/library/:playlistId` (저장 취소)
- `recordPlay()` 메서드 export — play 모듈에서 호출용
- 최근 재생 50개 초과 시 오래된 기록 자동 정리(LIB-007)

**프론트엔드 (잭)**
- `app/(tabs)/library.tsx` — 필터 칩 4종, 수정본 배지, 좌측 스와이프 액션
- Optimistic Update — 저장 취소 즉시 반영, 서버 재검증
- `libraryApi` — getLibrary, savePlaylist, unsavePlaylist, deleteRecentRecord

---

### 2-2. Playlist-Detail (루틴 카드 상세)

**백엔드 (이인수)**
- `session.entity.ts` — study/break/review ENUM, 소프트 삭제(is_deleted/deleted_at)
- `play-log.entity.ts` — `session_id` raw bigint → `@ManyToOne(Session)` 교체
- `GET /api/v1/playlists/:id`, `POST .../sessions/:sessionId/start`, `PATCH .../logs/:logId`
- 세션 교차 검증 (다른 플레이리스트의 세션으로 로그 생성 차단)

**프론트엔드 (잭)**
- `app/playlist/[id].tsx` — 정사각형 커버(220px), 세션 타입 배지(파랑/초록/주황)
- `playlistApi` — getDetail, startSession, endSession
- **연결 미완료:** 재생 버튼 → `startTimer()` → `router.push('/now-playing')` (TODO)

---

### 2-3. Now-Playing (타이머 + 집중 모드)

**백엔드 (이인수)**
- `distraction_logs` 엔티티 — play_log별 이탈 시작/종료 기록
- `POST /play/distraction/start`, `PATCH .../end`, `PATCH /play/logs/:logId/complete`
- `completePlayLog()` — play_log 완료 + daily_stats upsert 트랜잭션 처리
- `daily_stats`에 `(user_id, date)` UK 제약 필요 → V4 마이그레이션으로 해결

**프론트엔드 (잭)**
- `timerStore.ts` — tick/pause/resume/distraction/setMiniPlayer 상태 관리
- `app/now-playing.tsx` — 원형 프로그레스(두 반원 기법), AppState strict 이탈 감지
  - 15분 초과 일시정지 → "미완료" Alert → stopTimer → 뒤로가기
  - X 버튼 → setMiniPlayer(true) → 미니플레이어 유지
- `components/player/MiniPlayer.tsx` — 64px 하단 고정, 탭 → 전체화면 복귀
- `app/(tabs)/_layout.tsx` — Home/Search/Library 3탭 구성 완료

---

### 2-4. MyPage (마이페이지)

**백엔드 (이인수)**
- `GET /api/v1/mypage`, `PATCH .../profile`, `PATCH .../notifications`, `DELETE .../account`
- 프로필 편집: users 단일 테이블 (onboarding_profiles 별도 테이블 없음 확인)
- `dailyGoalHours` → 실제 `DailyHours` enum('1-2h'|'3-4h'|'5-6h'|'7h+') 적용
- 회원 탈퇴: 소프트 삭제 (is_deleted=true, deleted_at=now())

**프론트엔드 (잭)**
- `app/(tabs)/mypage.tsx` — 이니셜 아바타, D-Day 뱃지, 구독 티어 뱃지
- `EditProfileModal` — 이름/시험유형/D-Day/일일목표 편집
- Switch 알림 토글 4종, 로그아웃/탈퇴 이중 확인
- 4번째 탭 "마이페이지" 추가

---

### 2-5. Fact-Check (통계 리포트)

**백엔드 (이인수)**
- `StatsService` 확장 — getWeeklyReport, getSubjectAnalysis, getStreak, getFactCheckReport
- 주간 리포트: KST 월~일 기준 7일 breakdown
- 과목 분석: play_logs LEFT JOIN sessions GROUP BY session_title, 집중률 < 60% → 규칙 기반 recommendation 문구
- `GET /stats/fact-check`, `GET /stats/weekly`, `GET /stats/subjects`

**프론트엔드 (잭)**
- `app/fact-check.tsx` — 오늘 요약 카드, 7일 스택 막대 차트(View 높이 비례), 과목 집중률 게이지 바, 스트릭
- 홈 TodaySummaryCard 탭 → `/fact-check` 이미 연결되어 있었음 (추가 작업 불필요)

---

### 2-6. Notifications (알림)

**백엔드 (이인수)**
- `push_tokens` 엔티티 — FCM 디바이스 토큰, platform(ios/android), is_active
- `notification_logs` 엔티티 — type/title/body/is_read
- `POST /notifications/token`, `GET /notifications`, `PATCH /notifications/:logId/read`, `PATCH /notifications/read-all`
- FCM 실제 발송은 TODO 주석 처리 (firebase-admin 미설치)
- 라우팅 충돌 방지: `read-all`을 `:logId/read` 보다 선행 선언

**프론트엔드 (잭)**
- `app/notifications.tsx` — 상대 시간(dayjs 없이 ms 연산), 페이지네이션, 읽지않음 파란 점
- 홈 상단 🔔 아이콘 → `/notifications` 연결

---

### 2-7. Review (에빙하우스 복습 스케줄링)

**백엔드 (이인수)**
- `review_schedules` 엔티티 — review_date, interval_days(1/3/7), status(pending/completed/skipped)
- `completePlayLog()` 완료 시 자동으로 3개 복습 스케줄 생성 (트랜잭션 바깥 — 실패해도 세션 완료 롤백 없음)
- `EBBINGHAUS_INTERVALS`는 `@pace/shared-utils`에서 import (하드코딩 배제)
- `GET /review/today`, `GET /review/upcoming`, `PATCH /review/:id/complete`, `PATCH /review/:id/skip`

**프론트엔드 (잭)**
- `app/review.tsx` — today + upcoming Promise.all 동시 조회, 항목별 독립 로딩 처리
- 완료 항목: 취소선 + 녹색 체크, opacity 0.5 비활성화
- 홈 화면 복습 진입 배너 추가

---

## 3. 추가 완료된 인프라 작업

### V4 마이그레이션 (이명환)
파일: `planning/erd/migrations/V4__add_unique_constraints.sql`

| 제약 | 테이블 | 목적 |
|---|---|---|
| `uq_search_history_user_keyword` | search_history | (user_id, keyword) ON CONFLICT upsert |
| `uq_daily_stats_user_date` | daily_stats | (user_id, date) ON CONFLICT upsert |

> **주의:** 실제 운영 DB 적용 전 중복 행 존재 여부 사전 확인 필요 (중복 행 있으면 ALTER TABLE 실패)

---

## 4. 미완료 TODO (추후 진행)

| 항목 | 담당 | 내용 |
|---|---|---|
| `playlist/[id]` 재생 버튼 연결 | 잭 | `startTimer()` → `router.push('/now-playing')` |
| Apple/Google OAuth 실제 연결 | 이인수 | `expo-apple-authentication`, `expo-auth-session` |
| FCM firebase-admin 연동 | 이인수 | `sendNotification()` 실제 발송 구현 |
| `pnpm install` 루트 실행 | 공통 | `@pace/shared-utils` dayjs 심링크 생성 |
| `(tabs)/_layout.tsx` 탭 아이콘 | 잭 | 텍스트 폴백 → 실제 아이콘 (지수님 에셋 확정 후) |
| 관리자 웹 (apps/admin/) | 톰 하디 | 기획 완료 후 진행 |

---

## 5. 현재 개발 진행률

| 영역 | 완료 | 대기 |
|---|---|---|
| 백엔드 모듈 | auth, onboarding, home, search, library, playlist-detail, play, mypage, stats, notifications, review (11개) | — |
| 모바일 화면 | auth, onboarding, home, search, library, playlist-detail, now-playing, mypage, fact-check, notifications, review (11개) | — |
| 인프라 마무리 | pnpm install, OAuth 연결, FCM 연동 | 3개 |

---

## 6. 다음 단계

1. 마무리 작업 3종 처리 (playlist 재생 연결, pnpm install, OAuth/FCM TODO 확인)
2. 통합 테스트 (진도준 QA)
3. 관리자 웹 기획 및 개발 (추후)
