# PACE 버그 리포트

작성자: 진도준 (QA 엔지니어)
작성일: 2026-03-18
대상 코드: apps/api/src/, apps/mobile/

---

## BUG-001: Home 화면 useEffect dependency 누락으로 인한 lastActiveRef 오동작

- **심각도:** Minor
- **환경:** iOS / Android (모바일 앱 공통)
- **재현 경로:**
  1. 앱 실행 후 Home 화면 진입
  2. 다른 탭(Search, Library 등)으로 이동
  3. Home 탭으로 복귀
  4. 30초 이내임에도 refetch가 발생하거나, 30초 이후에도 refetch가 지연됨
- **예상 동작:** 30초(REFETCH_THRESHOLD_MS) 이상 경과 시에만 refetch 실행
- **실제 동작:** `useEffect(() => { ... })` — dependency array가 없어 매 렌더마다 실행됨. `lastActiveRef.current = now`가 매 렌더마다 갱신되어 30초 경과 기준점이 렌더 시마다 초기화됨.
- **원인 분석:**
  ```typescript
  // apps/mobile/app/(tabs)/index.tsx, line 147-155
  useEffect(() => {
    const now = Date.now();
    if (now - lastActiveRef.current > REFETCH_THRESHOLD_MS) {
      refetchSummary();
      ...
    }
    lastActiveRef.current = now; // 문제: 매 렌더마다 업데이트
  }); // dependency array 없음 — 매 렌더 실행
  ```
- **수정 제안:** AppState 또는 `useFocusEffect`를 활용한 명시적 앱 복귀 감지 로직으로 교체 필요. `useEffect(() => {...})` → `useFocusEffect(useCallback(() => {...}, []))` 형태로 변경

---

## BUG-002: 이미 완료된 play_log에 재완료 요청 시 daily_stats 중복 누적

- **심각도:** Major
- **환경:** 백엔드 API (NestJS)
- **재현 경로:**
  1. `POST /play/logs/{logId}/complete` 첫 번째 호출 — 정상 완료 처리
  2. 동일 logId로 `POST /play/logs/{logId}/complete` 두 번째 호출
  3. daily_stats.total_study_time 확인
- **예상 동작:** 이미 완료된 세션이므로 중복 처리 방지 (ForbiddenException 또는 멱등 처리)
- **실제 동작:** `play.service.ts` `completePlayLog()`에 `is_completed` 사전 확인 없음. 두 번째 호출 시 `daily_stats.total_study_time`에 netSec이 다시 누적됨. 또한 `reviewService.createReviewSchedules()`가 재호출되지만 중복 방지 로직으로 스케줄은 중복 생성되지 않음.
- **원인 분석:**
  ```typescript
  // apps/api/src/play/play.service.ts, line 133-193
  async completePlayLog(logId, userId, netMinutes) {
    const playLog = await this.playLogRepo.findOne({ where: { id: logId } });
    if (!playLog) throw new NotFoundException(...);
    if (playLog.user_id !== userId) throw new ForbiddenException(...);
    // is_completed 체크 없음 — 재완료 허용됨
    ...
    await manager.query(`INSERT INTO daily_stats ... ON CONFLICT ... DO UPDATE
      SET total_study_time = daily_stats.total_study_time + $3, ...`);
    // 중복 호출 시 total_study_time 이중 누적
  }
  ```
- **수정 제안:** `playLog.is_completed === true`인 경우 ForbiddenException 또는 void 반환(멱등) 처리 추가

---

## BUG-003: completeReview / skipReview — 이미 처리된 스케줄 상태 변경 미방어

- **심각도:** Minor
- **환경:** 백엔드 API (NestJS)
- **재현 경로:**
  1. `POST /review/{scheduleId}/complete` 호출 → status=COMPLETED
  2. 동일 scheduleId로 `POST /review/{scheduleId}/skip` 호출
  3. status 확인
- **예상 동작:** 이미 처리된 스케줄은 상태 변경 불가 (ForbiddenException)
- **실제 동작:** `completeReview()`와 `skipReview()` 모두 현재 status를 확인하지 않고 덮어씀. COMPLETED → SKIPPED 또는 SKIPPED → COMPLETED 전환이 가능함.
- **원인 분석:**
  ```typescript
  // apps/api/src/review/review.service.ts, line 181-195
  async completeReview(userId, scheduleId) {
    const schedule = await this.reviewScheduleRepo.findOne(...);
    if (!schedule) throw new NotFoundException(...);
    if (schedule.user_id !== userId) throw new ForbiddenException(...);
    // status 사전 확인 없음
    schedule.status = ReviewStatus.COMPLETED;
    schedule.completed_at = new Date(); // 재완료 시 덮어씀
    await this.reviewScheduleRepo.save(schedule);
  }
  ```
- **수정 제안:** `schedule.status !== ReviewStatus.PENDING` 조건 추가 필요. 정책 결정이 선행되어야 함 — 이미 완료된 스케줄을 다시 건너뜀 처리 허용할지 여부.

---

## BUG-004: 앱 강제 종료 시 진행 중 세션 상태 유실

- **심각도:** Major
- **환경:** iOS / Android (모바일 앱 공통)
- **재현 경로:**
  1. Now Playing 화면에서 타이머 실행 중
  2. 앱 강제 종료 (스와이프 킬 또는 메모리 부족 OS 강제 종료)
  3. 앱 재실행
- **예상 동작:** 진행 중이던 세션 정보(playLogId, elapsedSec, sessionTitle 등)가 복원되어 미니플레이어 또는 Now Playing 화면 재진입 가능
- **실제 동작:** `timerStore.ts` Zustand store는 persist 미적용 — 메모리 상태만 유지. 앱 재실행 시 `INITIAL_STATE`로 초기화됨. BE play_log의 `is_completed=false` 상태로 미완료 기록이 남지만 FE에서 이를 복원하는 로직 없음.
- **원인 분석:** `timerStore.ts`에 `zustand/middleware`의 `persist` 미사용. 앱 재실행 시 `/play/logs/{logId}` API로 미완료 세션을 조회하여 복원하는 로직 없음.
- **수정 제안:**
  1. `zustand/middleware`의 `persist`를 `AsyncStorage` 또는 `SecureStore`와 연동하여 타이머 상태 영속화
  2. 또는 앱 시작 시 BE에서 미완료 play_log를 조회하여 세션 복원 흐름 구현

---

## BUG-005: strict 모드에서 전화 수신 시 iOS에서 불필요한 이탈 감지

- **심각도:** Minor
- **환경:** iOS 전용
- **재현 경로:**
  1. strict 모드(focusMode='strict')에서 타이머 실행 중
  2. 전화 수신 알림 발생
  3. 전화를 받지 않고 무시
- **예상 동작:** 전화 수신 알림은 이탈로 간주하지 않아야 함 (또는 정책 결정 필요)
- **실제 동작:** iOS에서 전화 수신 시 AppState가 `active → inactive`로 변경됨. `handleAppStateChange()`에서 `inactive` 조건으로 이탈 감지 → `pauseTimer()` + `startDistraction()` API 호출 발생.
- **원인 분석:**
  ```typescript
  // apps/mobile/app/now-playing.tsx, line 261
  if ((nextState === 'background' || nextState === 'inactive') && running) {
    // 전화 수신 시 iOS inactive 이벤트로 이탈 처리됨
    pauseTimer();
    ...
  }
  ```
- **수정 제안:** iOS에서 `inactive` 상태 진입 시 즉시 이탈 처리하지 않고, 일정 시간(예: 3초) 후에도 `active`로 돌아오지 않으면 이탈 처리하는 지연 로직 추가. 또는 전화 수신과 앱 전환 이탈을 구분하는 정책 결정.

---

## BUG-006: 복습 날짜 계산에서 DST(서머타임) 미고려

- **심각도:** Minor
- **환경:** 백엔드 API (한국은 DST 미적용이나 서버 시간대 설정 오류 시 영향)
- **재현 경로:**
  1. 서버 시간대가 UTC로 설정된 경우
  2. KST 자정 근처(23:00~01:00 UTC)에 세션 완료
  3. review_date 계산 확인
- **예상 동작:** learnedAt 기준 KST +1일, +3일, +7일 날짜로 review_date 설정
- **실제 동작:**
  ```typescript
  // apps/api/src/review/review.service.ts, line 238-244
  private addDaysToDate(date: Date, days: number): string {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days); // UTC 기준 날짜 계산
    const kstMs = result.getTime() + 9 * 60 * 60 * 1000;
    return new Date(kstMs).toISOString().slice(0, 10);
  }
  ```
  UTC 기준으로 날짜를 더한 후 KST 변환하므로, KST 23:00에 학습 완료 시(= UTC 14:00) UTC 날짜 기준으로 계산하여 KST 날짜와 1일 차이 발생 가능.
- **수정 제안:** learnedAt을 KST 날짜 문자열로 먼저 변환 후 일수를 더하는 방식으로 변경. `addDaysToKstString()` 메서드 방식을 `addDaysToDate()`에도 적용.

---

## BUG-007: getSubjectAnalysis에서 동일 세션 타이틀 중복 집계 위험

- **심각도:** Minor
- **환경:** 백엔드 API (NestJS)
- **재현 경로:**
  1. 서로 다른 플레이리스트에 동일한 제목("수학 기본 문제")의 세션이 있는 경우
  2. `getSubjectAnalysis()` 호출
  3. 결과 확인
- **예상 동작:** 플레이리스트별로 세션을 구분하여 표시
- **실제 동작:**
  ```typescript
  // apps/api/src/stats/stats.service.ts, line 174-189
  .select(`COALESCE(sess.title, '[삭제된 세션]')`, 'session_title')
  ...
  .groupBy(`COALESCE(sess.title, '[삭제된 세션]')`)
  ```
  세션 타이틀로만 GROUP BY — 다른 플레이리스트의 동일 이름 세션이 합산됨.
- **수정 제안:** GROUP BY를 `session_id` 기준으로 변경하거나 `session_id + title` 복합키로 변경. 단, 삭제된 세션 처리 시 '[삭제된 세션]' fallback은 유지 필요.

---

## BUG-008: now-playing.tsx에서 AppState 복귀 시 resumeTimer 미호출

- **심각도:** Major
- **환경:** iOS / Android (strict 모드)
- **재현 경로:**
  1. strict 모드에서 타이머 실행 중 홈 버튼으로 앱 background 전환
  2. 앱 복귀 (active 상태)
  3. Now Playing 화면 확인
- **예상 동작:** 앱 복귀 시 사용자가 재개 버튼을 눌러야 타이머 재시작 — 이탈 시간이 정확히 기록된 후 의도적 재개
- **실제 동작:** `handleAppStateChange()`에서 `active` 복귀 시 이탈 시간 기록(`addDistractionTime`) 후 `resumeTimer()`를 호출하지 않음. 타이머가 일시정지 상태로 남아 있음.
- **원인 분석:** 설계 의도가 불명확. 복귀 시 자동 재개가 맞는지, 사용자 수동 재개가 맞는지 정책 확인 필요.
  ```typescript
  // apps/mobile/app/now-playing.tsx, line 274-293
  } else if (nextState === 'active') {
    // 이탈 시간 기록
    addDistractionTime(elapsed);
    // resumeTimer() 미호출 — 타이머 일시정지 상태 유지
  }
  ```
- **수정 제안:** 정책 결정 필요.
  - Option A: 복귀 시 자동 재개 → `resumeTimer()` 추가
  - Option B: 복귀 시 일시정지 유지 → 현재 동작이 의도된 것이면 UI에서 일시정지 상태임을 명확히 안내

---

*버그 심각도 기준:*
- *Critical: 서비스 운영 불가 수준의 장애*
- *Major: 핵심 기능 손상, 데이터 오염 위험*
- *Minor: 부분 기능 오동작, UX 불편*
