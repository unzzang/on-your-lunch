# FCM Fallback 최종 확정 및 구현 스펙 완성

> 일시: 2026-03-18
> 참석: PO(사용자), 위더(AI 시니어 기획자), 잭(프론트엔드 리드), 이명환(백엔드 아키텍트), 이인수(백엔드 개발자)

---

## 논의 배경

18번 회의에서 잭-이명환 알림 협의 3건(sync 엔드포인트, FCM fallback, 주간 리포트)이 완료됐으나, 하나의 미결 사항이 남아 있었음.

**미결 사항:** `POST /api/v1/notifications/fcm-fallback-request`에서 1유저 N기기 구조에서 어느 기기의 fallback 상태를 변경할지 특정하는 방법. JWT의 `user_id`만으로는 기기를 특정할 수 없음.

---

## 결정 사항

### 기기 식별 방식 — X-Device-Token 헤더 채택

이명환 제안: `X-Device-Token` 헤더에 FCM 토큰을 포함하여 전송.

잭이 프론트엔드 관점에서 검토 후 **수용 가능** 확인.

**확정 스펙:**

```
POST /api/v1/notifications/fcm-fallback-request
Authorization: Bearer {JWT}
X-Device-Token: {fcm_token}
Body: { "active": boolean }
```

서버 처리:
1. `X-Device-Token` 헤더 존재 여부 검증 → 없으면 400 반환
2. `device_tokens WHERE user_id = :userId AND token = :fcmToken` 조회
3. 행 미존재 시 404 반환
4. `is_fcm_fallback_active = :active` 업데이트 후 200 응답

**에러 코드 확정 (이명환 결정):**

| 케이스 | HTTP 코드 |
|---|---|
| `X-Device-Token` 헤더 미전달 | **400 Bad Request** |
| 토큰 매칭 실패 (DB에 FCM 토큰 없음) | **404 Not Found** |

---

## 클라이언트 핸들링 (잭)

- **400:** 클라이언트 코드 버그. Sentry 에러 로그 기록, 유저 노출 없음.
- **404:** FCM 토큰 갱신 타이밍 이슈 가능성. 토큰 재등록 후 1회 retry. retry 실패 시 로컬 알림 계속 사용(graceful degradation).
- `onTokenRefresh` 이벤트 발생 시: 토큰 서버 동기화 완료 후 `is_fcm_fallback_active` 상태 재확인 → 필요 시 fallback 재활성화 호출.

---

## 작업 완료 목록

| 작업 | 담당 | 파일 |
|---|---|---|
| `backend.md` 7-2절 최종 스펙 기입 | 이명환 | `planning/tech-spec/backend.md` |
| V2 마이그레이션 스크립트 작성 | 이인수 | `planning/erd/migrations/V2__alter_notifications.sql` |
| FCM Fallback API NestJS 구현 가이드 | 이인수 | `planning/tech-spec/impl-notifications-fcm-fallback.md` |

### V2 마이그레이션 변경 내역

1. `notification_log_sync_records` 테이블 신규 생성
2. `device_tokens.is_fcm_fallback_active` 컬럼 추가
3. `notification_settings`에 `learning_reminder_enabled`, `weekly_report_day`, `weekly_report_time` 컬럼 3개 추가

---

## 미결 사항

- [ ] 플레이리스트 삭제 정책 결정 (`play_logs/review_schedules`의 `playlist_id` FK가 RESTRICT 상태 → 삭제 시 처리 방식 미정)

---

## Action Items

- [x] **위더**: 잭-이명환 X-Device-Token 방식 협의 중재 및 확정
- [x] **이명환**: `backend.md` 7-2절 에러 코드 및 X-Device-Token 스펙 최종 기입
- [x] **잭**: 클라이언트 에러 핸들링 설계 확인
- [x] **이인수**: V2 마이그레이션 스크립트 작성
- [x] **이인수**: FCM fallback API NestJS 구현 가이드 작성
- [ ] **PO**: 플레이리스트 삭제 정책 결정 (V3 마이그레이션에 반영 예정)
