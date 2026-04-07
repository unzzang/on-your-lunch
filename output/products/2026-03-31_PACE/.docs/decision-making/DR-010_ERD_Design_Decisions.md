# DR-010. ERD 설계 의사결정

> 결정일: 2026-03-18
> 결정자: PO
> 관련 문서: planning/erd/PACE_ERD.md, 회의록 18

---

## 결정 사항

이명환(백엔드 아키텍트)이 설계한 ERD 초안에서 PO 판단이 필요한 3개 항목을 확정함.

| # | 항목 | 결정 | 근거 |
|---|---|---|---|
| 1 | Apple `sub` ID 저장 위치 | `social_accounts` 단일 관리 (`users.apple_sub_id` 제거) | 코드 단순성 우선. 중복 저장보다 `social_accounts WHERE provider='apple'` 단건 조회가 관리 비용이 낮음 |
| 2 | 학습 리마인더 ON/OFF | 모닝콜과 독립 컬럼 분리 (`learning_reminder_enabled` 추가) | 사용자 설정 화면에서 두 알림을 별도 제어 가능하게 제공 |
| 3 | `play_logs.playlist_id` 비정규화 | 유지 | 집계 쿼리 빈도가 높아 JOIN 생략 성능 이점이 실질적. 이명환 추천 수용 |

---

## 반영된 파일

- `planning/erd/PACE_ERD.md` — ERD 확정본 (상태: 초안 → 확정)
  - `users` 테이블: `apple_sub_id` 컬럼 제거
  - `notification_settings` 테이블: `learning_reminder_enabled` 컬럼 추가
  - `play_logs` 테이블: 비정규화 유지 (변경 없음, 의도 명시)
