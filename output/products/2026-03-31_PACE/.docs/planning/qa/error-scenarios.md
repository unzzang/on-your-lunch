# PACE 에러 케이스 시나리오

작성자: 진도준 (QA 엔지니어)
작성일: 2026-03-18
코드 기준: apps/api/src/ (NestJS), apps/mobile/ (React Native Expo Router)

---

## 1. 인증 (auth)

### AUTH-ERR-001: 만료된 Access Token으로 API 호출

- **트리거 조건:** JWT_ACCESS_EXPIRES_IN(기본 30분) 경과 후 API 요청
- **대상 엔드포인트:** JwtAuthGuard가 적용된 모든 인증 필요 API
- **기대 응답:** 401 Unauthorized
- **검증 포인트:** 클라이언트가 401 수신 시 자동으로 refreshByToken() 호출 후 재요청하는지 확인
- **엣지 케이스:** 토큰 만료 직전(±1초) 경계값 — 타이머 오차로 인한 레이스 컨디션 주의

### AUTH-ERR-002: 만료된 Refresh Token으로 재발급 시도

- **트리거 조건:** JWT_REFRESH_EXPIRES_IN(기본 30일) 경과 후 /auth/refresh 요청
- **대상 코드:** `refreshByToken()` — `storedToken.expires_at < new Date()` 분기
- **기대 응답:** 401 — "Refresh Token이 만료되었습니다. 다시 로그인해주세요."
- **검증 포인트:** revoked_at이 없는 토큰인데 expires_at만 지난 경우도 올바르게 처리되는지 확인

### AUTH-ERR-003: RTR 재사용 감지 (revoked 토큰 재사용)

- **트리거 조건:** 이미 `revoked_at`이 기록된 Refresh Token으로 /auth/refresh 재요청
- **대상 코드:** `refreshByToken()` — `storedToken.revoked_at` 분기 → `revokeAllUserTokens()` 호출
- **기대 응답:** 401 — "보안 위협이 감지되어 전체 세션이 종료되었습니다."
- **검증 포인트:**
  1. 해당 user_id의 `revoked_at IS NULL`인 모든 토큰이 무효화되었는지 DB 확인
  2. 정상 기기(다른 기기)도 로그아웃되었는지 확인
- **중요 차이:** `refresh(userId, rawToken)` vs `refreshByToken(rawToken)` — 두 경로의 재사용 감지 로직이 다름. `refresh()`는 token을 못 찾으면 바로 `revokeAllUserTokens()` 호출하는 반면, `refreshByToken()`은 찾은 후 `revoked_at` 확인. 두 경로 모두 검증 필요.

### AUTH-ERR-004: 로그아웃 후 동일 Refresh Token 재사용

- **트리거 조건:** `logout()` 호출 후 클라이언트가 캐시된 refresh token으로 재발급 시도
- **대상 코드:** `logout()` — revoked_at 기록 → `refreshByToken()` 재사용 감지 분기
- **기대 응답:** 401 — "보안 위협이 감지되어 전체 세션이 종료되었습니다."
- **엣지 케이스:** `logout()` 시 이미 없거나 만료된 토큰은 멱등 처리(return) → 정상 응답해야 함

### AUTH-ERR-005: 소프트 삭제 7일 초과 계정 로그인 시도

- **트리거 조건:** `is_deleted=true` && `deleted_at`이 7일 초과된 사용자가 소셜 로그인
- **대상 코드:** `socialLogin()` — `sevenDaysAgo` 비교 분기
- **기대 응답:** 401 — "삭제된 계정이에요. 새로 가입해주세요."
- **검증 포인트:**
  1. 7일 이내 재로그인 시 계정 복구(`is_deleted=false`) 동작 확인
  2. 경계값: 정확히 7일(168시간) 경과 시점

### AUTH-ERR-006: production 환경에서 소셜 토큰 미구현 상태 로그인

- **트리거 조건:** NODE_ENV=production에서 소셜 로그인 요청
- **대상 코드:** `verifySocialToken()` — `isProduction` 분기
- **기대 응답:** 401 — "Social token verification not implemented"
- **위험도:** Critical — production 배포 전 반드시 실제 소셜 API 연동 구현 필요

---

## 2. 플레이리스트 / 세션 (playlist-detail, play)

### PLAY-ERR-001: 존재하지 않는 플레이리스트 상세 조회

- **트리거 조건:** GET /playlists/{id} — 삭제된(is_deleted=true) 또는 없는 playlist_id
- **대상 코드:** `library.service.ts` `getLibrary()` — `p.is_deleted = false` 필터
- **기대 응답:** 404 NotFoundException
- **프론트엔드 검증:** `playlist/[id].tsx` — `isError=true` 시 에러 화면 렌더링 확인

### PLAY-ERR-002: 세션이 없는 플레이리스트 재생 시도

- **트리거 조건:** `playlist.sessions.length === 0` 상태에서 "학습 시작" 버튼 클릭
- **대상 코드:** `playlist/[id].tsx` `handlePlay()` — `sessions.length === 0` 분기
- **기대 동작:** Alert.alert("세션이 없습니다", ...) 표시 후 now-playing 진입 없음
- **검증 포인트:** startSession API가 호출되지 않아야 함

### PLAY-ERR-003: 다른 유저의 play_log에 세션 완료 요청

- **트리거 조건:** `completePlayLog(logId, userId)` — `playLog.user_id !== userId`
- **기대 응답:** 403 ForbiddenException — "본인의 재생 기록만 완료 처리할 수 있습니다."
- **검증 포인트:** daily_stats UPSERT 및 reviewService.createReviewSchedules가 실행되지 않아야 함

### PLAY-ERR-004: 이미 완료된 play_log에 재완료 요청

- **트리거 조건:** `is_completed=true`인 PlayLog에 `completePlayLog()` 재호출
- **대상 코드:** `play.service.ts` `completePlayLog()` — 현재 중복 완료 방어 로직 없음
- **실제 동작:** `is_completed=true`로 이미 세팅된 상태에서 재실행 → daily_stats에 netSec이 중복 누적
- **위험도:** Major — 학습 통계 오염 가능성 있음 (BUG-002 참조)

### PLAY-ERR-005: 타이머 15분 초과 일시정지 후 복귀 시도

- **트리거 조건:** strict 모드에서 앱을 background로 이동 후 15분(900초) 이상 경과 후 복귀
- **대상 코드:** `now-playing.tsx` `overdueAlertShownRef` 감지 로직 + `pauseStartRef`
- **기대 동작:** Alert "세션 미완료" 표시 → 확인 클릭 시 `stopTimer()` + `router.back()`
- **검증 포인트:**
  1. Alert가 한 번만 표시되는지 확인 (`overdueAlertShownRef` 중복 방지)
  2. 복귀 후 타이머가 재개되지 않는지 확인
  3. 미완료 처리 시 BE completePlayLog가 호출되지 않는지 확인

---

## 3. 복습 스케줄 (review)

### REV-ERR-001: 동일 세션 복습 스케줄 중복 생성 시도

- **트리거 조건:** 동일 session에 대해 `createReviewSchedules()` 두 번 연속 호출
- **대상 코드:** `review.service.ts` `createReviewSchedules()` — `findOne()` 중복 확인 + `continue`
- **기대 동작:** 이미 존재하는 interval은 INSERT 건너뜀, 새 interval만 INSERT
- **검증 포인트:** 이미 3개 모두 존재 시 `manager.save` 0회 호출 확인

### REV-ERR-002: 이미 완료된 스케줄 재완료 요청

- **트리거 조건:** `status=COMPLETED`인 ReviewSchedule에 `completeReview()` 재호출
- **대상 코드:** `review.service.ts` `completeReview()` — 현재 status 검증 없음
- **실제 동작:** `completed_at`이 덮어쓰기됨, 예외 미발생
- **기대 동작:** 멱등 처리(재실행 허용) 또는 ForbiddenException — 정책 명확화 필요
- **위험도:** Minor — 데이터 덮어쓰기 허용 여부 기획 재확인 필요

### REV-ERR-003: 이미 건너뛴 스케줄 재완료/재건너뜀 시도

- **트리거 조건:** `status=SKIPPED`인 스케줄에 `completeReview()` 또는 `skipReview()` 재호출
- **대상 코드:** 현재 두 메서드 모두 status 사전 확인 없음
- **실제 동작:** status가 변경됨, 예외 미발생
- **기대 동작:** 정책 결정 필요 — COMPLETED 후 SKIPPED 전환 허용 여부

### REV-ERR-004: 다른 유저의 스케줄 완료/건너뜀 시도

- **트리거 조건:** userId와 schedule.user_id 불일치
- **대상 코드:** `completeReview()`, `skipReview()` — `schedule.user_id !== userId` 분기
- **기대 응답:** 403 ForbiddenException

### REV-ERR-005: 복습 예정일이 없는 경우 getUpcomingReviews

- **트리거 조건:** 세션을 한 번도 완료하지 않아 review_schedule이 없는 신규 사용자
- **대상 코드:** `getUpcomingReviews()` — `getMany()` 빈 배열 반환
- **기대 동작:** 빈 배열 반환, 예외 미발생
- **프론트엔드 검증:** `review.tsx` — `upcomingGroups.length === 0`일 때 예정 복습 섹션 미표시

---

## 4. 라이브러리 (library)

### LIB-ERR-001: 이미 저장한 플레이리스트 중복 저장

- **트리거 조건:** `savePlaylist()` 동일 (userId, playlistId, type=LIKED)로 두 번 호출
- **대상 코드:** `library.service.ts` `savePlaylist()` — `existing` 확인 + ConflictException
- **기대 응답:** 409 ConflictException — "이미 저장된 플레이리스트입니다."

### LIB-ERR-002: 저장하지 않은 플레이리스트 저장 취소

- **트리거 조건:** `unsavePlaylist()` — LIKED 기록이 없는 (userId, playlistId)
- **기대 응답:** 404 NotFoundException — "저장된 플레이리스트를 찾을 수 없습니다."

### LIB-ERR-003: 최근 재생 50개 초과 시 정리 동작

- **트리거 조건:** `recordPlay()` — RECENT 타입 기록이 50개 이상인 상태에서 신규 재생
- **대상 코드:** `pruneRecentIfNeeded()` — count > RECENT_MAX(50) 시 oldest 삭제
- **검증 포인트:**
  1. 51번째 재생 시 가장 오래된 기록 1개가 삭제되는지 확인
  2. 기존 RECENT 행 갱신(last_played_at 업데이트)은 pruneRecentIfNeeded를 호출하지 않는지 확인
  3. `last_played_at IS NULL`인 행이 NULLS FIRST로 먼저 삭제되는지 확인
- **잠재 이슈:** 기존 행 갱신 시 count 증가하지 않으므로 prune 미호출 — 정상 동작이나 first visit 재방문 시 max 초과 안 됨

---

## 5. 알림 (notifications)

### NTF-ERR-001: 동일 FCM 토큰 중복 등록

- **트리거 조건:** `registerPushToken()` — 동일 (userId, token)으로 재등록
- **대상 코드:** `existing` 확인 → `is_active=true` 업데이트 (멱등 처리)
- **기대 동작:** 409 없이 200 반환, `is_active=true`로 갱신

### NTF-ERR-002: 이미 읽은 알림 재읽음 처리

- **트리거 조건:** `markAsRead()` — `is_read=true`인 알림에 재호출
- **대상 코드:** `is_read=true` 재설정 — 현재 멱등 처리(예외 없음)
- **기대 동작:** 200 반환, 상태 변화 없음

### NTF-ERR-003: 다른 유저의 알림 읽음 처리 시도

- **트리거 조건:** `markAsRead(userId=A, logId=B의 알림)`
- **대상 코드:** `findOne({ id: logId, user_id: userId })` — userId 불일치 시 null 반환
- **기대 응답:** 404 NotFoundException — "알림을 찾을 수 없습니다."
- **주의:** 403이 아닌 404 반환 — 다른 유저의 알림 존재 자체를 노출하지 않는 설계

### NTF-ERR-004: is_active=false 토큰에 알림 발송 (FCM 구현 후 검증 필요)

- **트리거 조건:** FCM 실제 연동 후 — `is_active=false`인 토큰으로 발송 시도
- **현재 상태:** FCM TODO 미구현 상태 — 현재는 로그만 기록
- **기대 동작:** 발송 실패 토큰은 `is_active=false` 처리 (unregistered 에러 코드 기준)

---

## 6. 프론트엔드 UX

### UX-ERR-001: 네트워크 오프라인 상태에서 API 호출

- **트리거 조건:** 비행기 모드 / WiFi 해제 후 앱 사용
- **검증 화면:** Home, Playlist Detail, Review
- **기대 동작:**
  - `index.tsx`: `handleRefresh()` catch 블록 → Alert "네트워크 오류, 네트워크 연결을 확인해주세요."
  - `playlist/[id].tsx`: `isError=true` → 에러 화면 + 다시 시도 버튼
  - `review.tsx`: Alert "복습 데이터를 불러올 수 없습니다."
- **검증 포인트:** 오프라인 상태에서 타이머가 이미 실행 중인 경우 — `now-playing.tsx`에서 이탈 기록 API 실패를 무시(`catch {}`)하고 UI는 정상 동작하는지 확인

### UX-ERR-002: strict 모드 앱 이탈 → 복귀 시 타이머 상태

- **트리거 조건:** `focusMode='strict'` 상태에서 홈 버튼 또는 다른 앱 전환
- **대상 코드:** `now-playing.tsx` `handleAppStateChange()`
- **기대 동작:**
  1. background/inactive → `pauseTimer()` + `playApi.startDistraction()` 호출
  2. active 복귀 → 이탈 시간 `addDistractionTime(elapsed)` + `playApi.endDistraction()` 호출
  3. 타이머는 `isRunning=false` 상태 유지 (자동 재개 없음)
- **Android 특이사항:** `inactive` 이벤트 발생 안 함 — background만으로 이탈 감지

### UX-ERR-003: 미니플레이어 상태에서 앱 재시작 (강제 종료 후 재실행)

- **트리거 조건:** `isMiniPlayer=true` 상태에서 앱 강제 종료(스와이프 킬) 후 재실행
- **대상 코드:** `timerStore.ts` — Zustand는 메모리 내 상태 (persist 미적용)
- **기대 동작:** 앱 재시작 시 timerStore가 `INITIAL_STATE`로 초기화 → 미니플레이어 미표시
- **문제점:** 진행 중인 세션 정보가 유실됨 — 사용자는 재시작 시 세션 복원 불가
- **위험도:** Major — 장시간 학습 중 메모리 부족으로 앱이 강제 종료된 경우 데이터 유실 (BUG-004 참조)

### UX-ERR-004: 탭 전환 중 타이머 동작 유지 확인

- **트리거 조건:** Now Playing → X 버튼으로 미니플레이어 전환 → Library 탭 이동 후 복귀
- **기대 동작:** `isMiniPlayer=true` 상태에서 `isRunning` 상태 유지 (타이머 계속 진행)
- **검증 포인트:** `setMiniPlayer(true)`는 `isRunning`을 변경하지 않음 — 탭 전환 시 setInterval cleanup 후 재등록 여부 확인

### UX-ERR-005: Home 화면 무한 refetch 위험

- **트리거 조건:** `index.tsx` `useEffect` — deps 배열 없음 (매 렌더마다 실행)
- **대상 코드:** `useEffect(() => { ... })` — dependency array 없이 선언됨
- **실제 동작:** 매 렌더링마다 `Date.now() - lastActiveRef.current` 체크 후 조건부 refetch
- **30초 임계값으로 실제 API 폭주는 방지되지만:** `lastActiveRef.current = now` 업데이트가 매 렌더마다 발생 → 30초 경과 감지가 부정확해짐 (BUG-001 참조)

### UX-ERR-006: 복습 완료 후 UI 상태 불일치 (건너뜀 처리)

- **트리거 조건:** `review.tsx` `handleSkip()` 성공 후 로컬 상태 업데이트
- **대상 코드:** `setTodayData` — `isSkipped: true`로 업데이트하지만 `completedCount`는 변경하지 않음
- **기대 동작:** 건너뜀은 completedCount에 포함되지 않아야 함 — 현재는 올바름
- **추가 확인:** 건너뜀 후 `isDone=true`로 처리되어 버튼이 사라지는지 확인

---

## 7. 크로스 플랫폼 일관성 위험 지점

### CROSS-001: AppState 이벤트 차이 (iOS vs Android)

- **현상:**
  - iOS: `active → inactive → background` 순서로 이벤트 발생 (전화 수신 시에도 inactive 발생)
  - Android: `active → background` (inactive 없음)
- **영향:** `now-playing.tsx` `handleAppStateChange()`에서 `inactive` 조건으로 이탈 감지
  - iOS에서는 전화 수신 시에도 이탈로 감지됨 → 타이머 일시정지 발생 (의도된 동작인지 정책 확인 필요)
  - Android에서는 inactive 없이 background만 발생 — 동작은 동일하게 처리됨
- **검증 필요:** 전화 수신 중 타이머 동작 정책 명확화 (일시정지 vs 유지)

### CROSS-002: SecureStore 동작 차이

- **현상:**
  - iOS: 키체인(Keychain) 저장 — 앱 삭제 후 재설치해도 데이터 유지 가능 (기기 설정에 따라 다름)
  - Android: Android Keystore 또는 SharedPreferences 저장 — 앱 삭제 시 데이터 삭제
- **영향:** `authStore.ts` — `pace_refresh_token` SecureStore 저장
  - iOS에서 앱 삭제 후 재설치 시 이전 refresh_token이 남아있을 수 있음
  - 해당 토큰으로 refresh 시도 시 → RTR 재사용 감지 가능성 (토큰이 이미 revoked인 경우)
- **검증 필요:** 앱 재설치 후 첫 실행 시 SecureStore에서 기존 refresh_token을 삭제하는 로직 필요

### CROSS-003: 타이머 background 동작 차이

- **현상:**
  - iOS: 백그라운드에서 JavaScript 실행 제한 (약 3분 후 강제 종료)
  - Android: 백그라운드 작업 정책이 Android 버전에 따라 다름 (Doze Mode)
- **영향:** `free 모드(Option B)`에서 백그라운드 타이머 계속 진행 가정
  - iOS에서는 앱이 백그라운드로 이동 후 약 3분 이후 setInterval 중단 가능
  - Android에서는 Doze Mode 진입 시 네트워크 및 타이머 정지
- **현재 코드:** `timerStore.ts`의 `tick()`은 `setInterval`에 의존 → 백그라운드에서 미실행
- **검증 필요:** free 모드에서 background elapsed time 계산 방식 — setInterval 대신 시작 시각 기반 계산 필요

### CROSS-004: Android 상태바/다이나믹 아일랜드 표시

- **현상:** iOS는 Dynamic Island, Android는 상태바 알림으로 현재 세션 표시
- **현재 구현:** 미니플레이어(`isMiniPlayer=true`) 표시만 구현, OS 레벨 상태바 연동 미구현
- **검증 필요:** 미니플레이어가 탭바와 겹치지 않는지, SafeAreaView 적용 여부 확인

---

*이 문서는 코드 기반으로 도출된 에러 케이스이며, 실제 QA 테스트 진행 시 재현 환경(OS 버전, 디바이스 모델)과 함께 업데이트 예정입니다.*
