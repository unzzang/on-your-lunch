# PACE 모바일 통합 테스트 결과

> 테스트 일시: 2026-03-27
> 환경: iOS 시뮬레이터 + localhost:3000 API (NestJS) + localhost:8081 (Expo)
> 테스터: 진도준 (QA 엔지니어)
> 테스트 방법: curl API 호출 + 프론트엔드 코드 정적 분석

## 요약

- 전체 화면 수: 11
- 정상: 3 (로그인, Now Playing, 플레이리스트 상세)
- 버그 발견: 8개 화면에서 총 16건
  - Critical (서비스 불가): 2건
  - Major (주요 기능 장애): 8건
  - Minor (사소한 불일치): 6건

---

## 화면별 테스트 결과

### 1. 로그인 화면

- **API 테스트**: `POST /api/v1/auth/dev-login` -- HTTP 200
  ```json
  {
    "accessToken": "eyJ...",
    "refreshToken": "029a...",
    "user": {
      "id": "1",
      "email": "test@pace.dev",
      "name": "테스트 유저",
      "onboardingCompleted": true
    }
  }
  ```
- **프론트 코드 검증**:
  - `login.tsx` L112: `data.user.onboardingCompleted` 접근 -- API 응답에 해당 필드 존재. 정상.
  - `login.tsx` L338: `authApi.devLogin()` -> `loginWithToken(data.user, data.accessToken, data.refreshToken)` -- 매칭 정상.
- **상태**: 정상

#### [Minor] BUG-INT-001: AuthResponseDto에 subscriptionTier 누락

- **환경**: 전 플랫폼
- **재현 조건**: dev-login 또는 social-login 호출
- **기대 결과**: 프론트 `AuthTokenResponse` 타입에 `user.subscriptionTier` 필드가 정의되어 있으므로 (`api.ts` L104), API 응답에도 해당 필드가 포함되어야 함
- **실제 결과**: API `AuthResponseDto` (`auth-response.dto.ts`)에는 `subscriptionTier`가 없음. `buildAuthResponse()` 메서드에서도 해당 필드를 반환하지 않음
- **영향**: `authStore`의 `User.subscriptionTier`가 항상 `undefined`가 됨. 당장 크래시는 아니지만 마이페이지에서 구독 뱃지가 정확하지 않을 수 있음
- **심각도**: Minor

---

### 2. 온보딩 화면

- **API 테스트**: `POST /api/v1/onboarding/complete`
  - `customExamSubjects` 필드 포함 시 -- HTTP 400 `"property customExamSubjects should not exist"`
  - `customExamSubjects` 제외 시 (이미 완료된 유저) -- HTTP 400 `"이미 온보딩이 완료된 계정입니다"`
- **프론트 코드 검증**:
  - `onboardingStore.ts` L166-171: `customExamSubjects` 필드를 항상 전송
  - `api.ts` L211-220: `OnboardingCompletePayload` 타입에 `customExamSubjects` 필드 포함
  - 백엔드 `CompleteOnboardingDto`에는 `customExamSubjects` 필드가 없음 (class-validator의 `whitelist` 옵션으로 거부)
- **상태**: 버그

#### [Critical] BUG-INT-002: 온보딩 완료 API에서 customExamSubjects 필드 거부

- **환경**: 전 플랫폼
- **재현 조건**:
  1. 신규 사용자 온보딩 진행
  2. Step 1에서 "기타" 시험 유형 선택
  3. 직접 입력 과목 입력 후 Step 3까지 완료
  4. "시작하기" 버튼 탭
- **기대 결과**: 온보딩 완료 처리 + 추천 플레이리스트 생성
- **실제 결과**: HTTP 400 -- `"property customExamSubjects should not exist"`. 온보딩 완료 불가
- **원인**: 프론트(`OnboardingCompletePayload`)는 `customExamSubjects` 필드를 전송하지만, 백엔드 DTO(`CompleteOnboardingDto`)에는 해당 필드가 정의되지 않아 class-validator의 whitelist 검증에서 거부됨
- **영향**: "기타" 시험 유형 선택 시 온보딩 완료 불가능 (서비스 진입 차단)
- **심각도**: Critical

#### [Major] BUG-INT-003: 온보딩 API 응답 구조 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 온보딩 완료 API 호출
- **기대 결과**: 프론트 `OnboardingCompleteResponse` 타입에 맞는 `{ recommendedRoutineIds: string[], onboardingCompleted: boolean }` 응답
- **실제 결과**: 백엔드 `OnboardingStatusResponseDto`는 `{ onboardingCompleted, examType, dDay, dailyHours }` 구조. `recommendedRoutineIds` 미존재
- **영향**: 프론트에서 `data.recommendedRoutineIds`를 참조하면 undefined가 됨. 현재 코드에서는 사용하지 않아 즉각적 크래시는 없으나, 추후 추천 플레이리스트 표시 기능 구현 시 문제

---

### 3. 홈 화면

- **API 테스트**:
  - `GET /api/v1/home/today-summary` -- HTTP 200
    ```json
    {"hasStudiedToday":false,"netMinutes":0,"sessionCount":0,"focusRate":null}
    ```
  - `GET /api/v1/home/quick-picks` -- HTTP 200, `[]` (빈 배열)
  - `GET /api/v1/home/sections` -- HTTP 200
    ```json
    {"recommendedByTime":[],"personalized":[],"popular":[],"newPlaylists":[]}
    ```
- **상태**: 버그

#### [Major] BUG-INT-004: today-summary 응답 필드명 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 홈 화면 진입 시 자동 호출
- **기대 결과**: 프론트 `TodaySummaryResponse` 타입: `{ netMinutes, completedSessions, focusRate }`
- **실제 결과**: API 실제 응답: `{ hasStudiedToday, netMinutes, sessionCount, focusRate }`
  - `completedSessions` vs `sessionCount` -- 필드명 불일치
  - `hasStudiedToday` -- 프론트 타입에 미정의
- **영향**: `summary.completedSessions`가 항상 `undefined`가 되어 홈 요약 카드에서 "undefined세션 완료"로 표시될 수 있음
- **심각도**: Major

#### [Major] BUG-INT-005: quick-picks 응답 구조 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 홈 화면 진입 시 자동 호출
- **기대 결과**: 프론트 `QuickPicksResponse` 타입: `{ items: PlaylistCardData[] }`
- **실제 결과**: API가 배열을 직접 반환 (`[]`), `{ items: [] }` 형태가 아님
- **영향**: `quickPicks?.items?.length`가 에러 또는 undefined가 됨. 빠른 선택 섹션이 표시되지 않음. `quickPicks!.items`에서 TypeError 발생 가능
- **심각도**: Major

#### [Major] BUG-INT-006: home/sections 응답 구조 불일치 (방어 코드 존재)

- **환경**: 전 플랫폼
- **재현 조건**: 홈 화면 진입
- **기대 결과**: 프론트 `HomeSectionsResponse` 타입: `{ sections: RecommendedSection[] }` (`key`, `title`, `items` 포함)
- **실제 결과**: API가 `{ recommendedByTime, personalized, popular, newPlaylists }` flat 구조 반환
- **영향**: 프론트에서 방어 코드로 변환 처리하고 있음 (`index.tsx` L121-129). 현재 크래시 없음. 단, `creatorName` 필드가 API 응답에 없어서 추천 카드에서 제작자명이 비어 보일 수 있음
- **심각도**: Minor (방어 코드로 대응 중이나, 스펙과 실제 응답이 불일치)

---

### 4. 검색 화면

- **API 테스트**:
  - `GET /api/v1/search?query=test` -- HTTP 500 `"Internal server error"`
  - `GET /api/v1/search/history` -- HTTP 200, `[]`
- **상태**: 버그

#### [Critical] BUG-INT-007: 검색 API 서버 오류 (500)

- **환경**: 전 플랫폼
- **재현 조건**: 검색어 입력 후 300ms 디바운스 경과
- **기대 결과**: 검색 결과 또는 빈 결과 반환
- **실제 결과**: HTTP 500 Internal Server Error. 검색 기능 전면 불가
- **추정 원인**: `search.service.ts`에서 `p.exam_types` 관계 JOIN 시 데이터베이스에 playlist 데이터가 없거나, `play_count` 컬럼 참조 오류 가능. 서버 로그 확인 필요
- **심각도**: Critical

#### [Major] BUG-INT-008: 검색 결과 응답 필드 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 검색 API가 정상 동작하는 경우 (500 수정 후)
- **기대 결과**: 프론트 `SearchResponse`: `{ items: SearchPlaylistItem[], popularKeywords?: string[] }`
  - `SearchPlaylistItem`: `{ id, title, coverImageUrl, creatorName, totalDurationMin, sessionCount? }`
- **실제 결과**: 백엔드 `SearchResultDto`: `{ playlists, total, hasMore }`
  - `SearchPlaylistItemDto`: `{ id, title, coverImageUrl, totalDurationMin, creatorType, examTypes }`
  - `items` vs `playlists` -- 키 불일치
  - `creatorName` 없음, 대신 `creatorType` 존재
  - `popularKeywords` 미구현
- **영향**: 검색 결과가 정상 반환되더라도 프론트에서 `data.items`가 undefined가 되어 빈 결과로 표시됨
- **심각도**: Major

#### [Minor] BUG-INT-009: 검색 히스토리 응답 구조 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 검색 모드 진입 시 히스토리 조회
- **기대 결과**: 프론트 `SearchHistoryResponse`: `{ items: SearchHistoryItem[] }` (id: string)
- **실제 결과**: API가 배열 직접 반환 (`[]`), `{ items: [] }` 아님. 또한 백엔드의 id가 number 타입이고, 프론트는 string 타입으로 기대
- **영향**: `res.data?.items`가 undefined. 프론트 코드(`search.tsx` L111)에서 `res.data?.items ?? []` fallback으로 빈 배열이 됨. 기능적으로는 동작하나 서버 히스토리가 반영되지 않음
- **심각도**: Minor

---

### 5. 라이브러리 화면

- **API 테스트**: `GET /api/v1/library` -- HTTP 200, `[]`
- **상태**: 버그

#### [Major] BUG-INT-010: 라이브러리 API 응답 구조 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 내 보관함 탭 진입
- **기대 결과**: 프론트 `LibraryResponse`: `{ items: LibraryItem[], nextCursor: string | null }`
  - `LibraryItem` 필드: `id, playlistId, title, coverImageUrl, creatorName, totalDurationMin, type, originalPlaylistId, lastPlayedAt, savedAt`
- **실제 결과**: API가 배열 직접 반환. `items`, `nextCursor` 래핑 없음
  - 백엔드 filter 파라미터: `'all' | 'saved' | 'created'`
  - 프론트 filter 파라미터: `'all' | 'liked' | 'modified' | 'recent'`
  - 페이지네이션: 백엔드는 page 기반, 프론트는 cursor 기반
- **영향**:
  - `data.pages.flatMap(page => page.items ?? [])` 호출 시 `page.items`가 undefined (배열이 직접 반환되므로)
  - useInfiniteQuery의 `getNextPageParam`에서 `lastPage.nextCursor`가 undefined
  - 필터 값 불일치로 서버 필터링 미작동
- **심각도**: Major

---

### 6. 마이페이지 화면

- **API 테스트**: `GET /api/v1/mypage` -- HTTP 200
  ```json
  {
    "id": "1",
    "name": "테스트 유저",
    "email": "test@pace.dev",
    "examType": null,
    "dDay": null,
    "dailyHours": null,
    "subscriptionTier": "free",
    "notificationSettings": null
  }
  ```
- **상태**: 버그

#### [Major] BUG-INT-011: 마이페이지 프로필 필드 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 마이페이지 탭 진입
- **기대 결과**: 프론트 `MypageProfile` 타입: `{ id: number, name, email, examType, dDay: number | null, dailyGoalHours: number, subscriptionTier, notificationSettings: NotificationSettings }`
- **실제 결과**:
  - `id`가 string `"1"`로 반환 (프론트는 number 기대)
  - `dailyHours` 필드명 (백엔드) vs `dailyGoalHours` (프론트) -- 불일치
  - `notificationSettings`가 `null` (프론트는 NotificationSettings 객체 기대)
- **영향**:
  - `notificationSettings`가 null일 때 프론트 코드 L123에서 fallback 처리가 있으므로 즉시 크래시는 없음
  - 그러나 `dailyGoalHours`가 undefined이므로 프로필 편집 모달에서 기본값이 "undefined"로 표시됨
  - `id` 타입 불일치는 JavaScript의 유연한 타입 처리로 즉각적 문제는 없으나 엄격 비교 시 문제

---

### 7. 플레이리스트 상세 화면

- **API 테스트**: `GET /api/v1/playlists/1` -- HTTP 404 (테스트 DB에 데이터 없음)
- **프론트 코드 검증**:
  - 404/에러 시 에러 화면 정상 표시 (L125-143)
  - `PlaylistDetailResponse` 타입과 API 응답 구조 매칭 검증은 데이터 부재로 불가
- **상태**: 정상 (데이터 부재로 에러 화면 표시는 정상 동작)

---

### 8. Now Playing 화면

- **프론트 코드 검증**:
  - API 직접 호출이 아닌, `playerStore`/`timerStore` 상태에서 타이머 동작
  - `playApi.startDistraction()`, `playApi.endDistraction()`, `playApi.completeLog()` 연동
  - 해당 API는 플레이리스트 재생 중에만 호출되므로 현재 테스트 불가
- **상태**: 정상 (코드 레벨 검증 완료, 런타임 테스트는 데이터 필요)

---

### 9. Fact-Check 화면

- **API 테스트**: `GET /api/v1/stats/fact-check?period=week` -- HTTP 200
  ```json
  {
    "period": "week",
    "weeklyReport": { "weekLabel": "이번 주", "startDate": "2026-03-23", ... "dailyBreakdown": [...] },
    "subjectAnalysis": [],
    "topStreak": 0,
    "todaySummary": { "netMinutes": 0, "distractionMinutes": 0, "focusRate": null }
  }
  ```
- **상태**: 버그

#### [Major] BUG-INT-012: Fact-Check 응답 구조와 프론트 타입 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 홈 요약 카드 탭 또는 Fact-Check 화면 직접 진입
- **기대 결과**: 프론트 `FactCheckReportResponse` 타입:
  ```
  { period, totalNetMinutes, totalDistractionMinutes, focusRate, streak, daily: DailyStatItem[], subjects: SubjectStatItem[] }
  ```
  - `DailyStatItem`: `{ date, netMinutes, distractionMinutes }`
- **실제 결과**: API 응답 구조:
  ```
  { period, weeklyReport: WeeklyReportDto, subjectAnalysis, topStreak, todaySummary }
  ```
  - `weeklyReport.dailyBreakdown[].dayLabel` 필드 추가 (프론트 미인지)
  - 프론트가 `data.totalNetMinutes`를 직접 접근하나, 실제는 `data.weeklyReport.totalNetMinutes`에 위치
  - `data.daily` vs `data.weeklyReport.dailyBreakdown` -- 경로 불일치
  - `data.streak` vs `data.topStreak` -- 필드명 불일치
  - `data.subjects` vs `data.subjectAnalysis` -- 필드명 불일치
- **영향**:
  - `fact-check.tsx` L204: `data.totalNetMinutes`가 undefined -> "0분" 표시 (formatMinutes(undefined ?? 0))
  - L147: `data.daily`가 undefined -> WeeklyBarChart에 빈 배열 전달 -> 차트 빈 상태
  - L149: `data.streak`가 undefined -> 0 표시 (실제 streak은 `data.topStreak`에 존재)
  - L152: `data.subjects`가 undefined -> SubjectList에 빈 배열 -> 과목 분석 미표시
- **심각도**: Major (화면 전체가 빈 데이터로 표시됨)

---

### 10. 알림 화면

- **API 테스트**: `GET /api/v1/notifications?page=1&limit=20` -- HTTP 200
  ```json
  {"data":[],"total":0,"page":1,"limit":20}
  ```
- **상태**: 버그

#### [Minor] BUG-INT-013: 알림 목록 응답 필드명 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 알림 화면 진입
- **기대 결과**: 프론트 `NotificationsListResponse`: `{ items, hasNextPage, totalCount }`
  - `NotificationItem`: `{ logId, type, title, body, isRead, sentAt }`
- **실제 결과**: 백엔드 `NotificationListResponseDto`: `{ data, total, page, limit }`
  - `NotificationListDto`: `{ id, type, title, body, sentAt, isRead }` (id vs logId)
  - `items` vs `data` -- 키 불일치
  - `hasNextPage` 미존재, `totalCount` vs `total` -- 불일치
- **영향**:
  - `notifications.tsx` L79: `res.data?.items`가 undefined -> `[]` fallback
  - L80: `res.data?.hasNextPage`가 undefined -> `false` fallback -> 페이지네이션 작동 안 함
  - 알림 데이터가 있어도 목록에 표시되지 않음
  - `item.logId`가 undefined (서버는 `id` 필드) -> markRead 호출 시 undefined 전송
- **심각도**: Minor (현재 알림 데이터 없어 실제 영향 없으나, 데이터 생기면 표시 불가)

---

### 11. 복습 화면

- **API 테스트**:
  - `GET /api/v1/review/today` -- HTTP 200
    ```json
    {"totalCount":0,"completedCount":0,"items":[]}
    ```
  - `GET /api/v1/review/upcoming?days=7` -- HTTP 200, `[]`
- **상태**: 버그

#### [Major] BUG-INT-014: 복습 today 응답의 items 필드 구조 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 복습 화면 진입 시 오늘 복습 데이터가 있을 때
- **기대 결과**: 프론트 `ReviewItem`: `{ id, sessionTitle, playlistTitle, scheduledDate, isCompleted, isSkipped }`
- **실제 결과**: 백엔드 `ReviewScheduleDto`: `{ id, sessionId, sessionTitle, playlistTitle, reviewDate, intervalDays, status }`
  - `scheduledDate` vs `reviewDate` -- 필드명 불일치
  - `isCompleted`/`isSkipped` boolean vs `status: 'pending' | 'completed' | 'skipped'` -- 구조 불일치
- **영향**:
  - `item.isCompleted`가 항상 undefined -> 모든 항목이 "미완료"로 표시 (완료 처리해도 UI 미반영)
  - `item.isSkipped`도 undefined -> 건너뛰기 처리해도 UI 미반영
- **심각도**: Major

#### [Major] BUG-INT-015: 복습 upcoming 응답 구조 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 복습 화면 진입 시 예정 복습 데이터가 있을 때
- **기대 결과**: 프론트 `ReviewUpcomingResponse`: `{ groups: [{ date, items }] }`
- **실제 결과**: API가 `ReviewScheduleDto[]` 배열을 직접 반환 (date별 그룹핑 없음)
- **영향**: `upcomingData?.groups`가 undefined -> 예정 복습 섹션 미표시
- **심각도**: Major

#### [Minor] BUG-INT-016: 복습 완료/건너뛰기 API 응답 불일치

- **환경**: 전 플랫폼
- **재현 조건**: 복습 항목 "복습하기" 또는 "건너뛰기" 탭
- **기대 결과**: HTTP 200 + 응답 body
- **실제 결과**: 백엔드가 HTTP 204 No Content 반환 (body 없음)
- **영향**: 프론트에서 `.data`를 참조하지 않으므로 기능적으로는 문제없음. 단 axios가 204를 정상 처리하므로 실질적 버그는 아님
- **심각도**: Minor

---

## 공통 이슈

### API Base URL 포트 불일치

- **프론트 코드** (`lib/api.ts` L4, `authStore.ts` L74, L114): `EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api'`
- **실제 API 서버**: `localhost:3000`
- **영향**: 환경변수 미설정 시 기본값이 3001 포트를 바라보므로 모든 API 호출 실패
- **현재 상태**: EXPO_PUBLIC_API_URL 환경변수가 올바르게 설정되어 있다면 문제 없음. 미설정 시 전면 장애.

---

## 버그 우선순위 요약

| # | 심각도 | 화면 | 버그 ID | 제목 |
|---|--------|------|---------|------|
| 1 | Critical | 온보딩 | BUG-INT-002 | customExamSubjects 필드 거부 (신규 유저 온보딩 불가) |
| 2 | Critical | 검색 | BUG-INT-007 | 검색 API 500 서버 오류 |
| 3 | Major | 홈 | BUG-INT-004 | today-summary completedSessions vs sessionCount |
| 4 | Major | 홈 | BUG-INT-005 | quick-picks 응답 래핑 누락 |
| 5 | Major | 검색 | BUG-INT-008 | 검색 결과 items vs playlists 구조 불일치 |
| 6 | Major | 라이브러리 | BUG-INT-010 | 응답 배열 직접 반환 + 필터/페이지네이션 불일치 |
| 7 | Major | 마이페이지 | BUG-INT-011 | dailyGoalHours vs dailyHours + notificationSettings null |
| 8 | Major | Fact-Check | BUG-INT-012 | 중첩 구조 vs flat 구조 전면 불일치 |
| 9 | Major | 복습 | BUG-INT-014 | isCompleted/isSkipped vs status enum |
| 10 | Major | 복습 | BUG-INT-015 | upcoming 그룹핑 미구현 |
| 11 | Minor | 로그인 | BUG-INT-001 | subscriptionTier 응답 누락 |
| 12 | Minor | 온보딩 | BUG-INT-003 | 응답 DTO 구조 불일치 |
| 13 | Minor | 홈 | BUG-INT-006 | sections flat 구조 (방어 코드 존재) |
| 14 | Minor | 검색 | BUG-INT-009 | 히스토리 응답 래핑 누락 |
| 15 | Minor | 알림 | BUG-INT-013 | items vs data, logId vs id |
| 16 | Minor | 복습 | BUG-INT-016 | 204 No Content (실질적 영향 없음) |

---

## 수정 권고 방향

대부분의 버그가 **프론트 타입 정의와 백엔드 실제 응답 구조 간 불일치**에서 발생합니다. 근본 원인은 `shared-types` 패키지를 통한 API 계약이 아직 연결되지 않은 상태에서 프론트/백엔드가 각각 독립적으로 타입을 정의했기 때문입니다.

**권고:**
1. `packages/shared-types`에 API 요청/응답 타입을 단일 소스로 정의
2. 백엔드 DTO와 프론트 API 타입을 shared-types에서 공유
3. Critical 2건 (온보딩 customExamSubjects, 검색 500)은 즉시 수정 필요
4. Major 8건은 프론트 또는 백엔드 한쪽을 기준으로 통일 (어느 쪽이 기능 명세에 더 부합하는지 확인 후 결정)
