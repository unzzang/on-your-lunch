# DR-013. 삭제 정책 — 전체 소프트 삭제

> 결정일: 2026-03-18
> 결정자: PO
> 관련 문서: planning/erd/PACE_ERD.md, planning/erd/migrations/V3__soft_delete.sql

---

## 배경

`playlists` 테이블 삭제 시 `play_logs.playlist_id`, `review_schedules.playlist_id` FK가 `RESTRICT` 상태라 하드 삭제가 불가능한 상황. 처리 방식 결정 필요.

검토한 옵션:
- A: 소프트 삭제 (`is_deleted = true`) — 기록 보존
- B: 하드 삭제 + `ON DELETE CASCADE` — 연관 로그도 함께 삭제
- C: 사용자는 숨김(hide)만, 삭제는 관리자만 가능

---

## 결정

**모든 삭제는 소프트 삭제로 진행한다.**

---

## 적용 범위

소프트 삭제 대상 테이블에 아래 컬럼을 추가한다:

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `is_deleted` | `BOOLEAN` | `FALSE` | 삭제 여부 |
| `deleted_at` | `TIMESTAMP` | `NULL` | 삭제 처리 시각 |

- FK는 `RESTRICT` 유지 — 소프트 삭제이므로 `CASCADE` 불필요
- 모든 조회 쿼리에 `WHERE is_deleted = FALSE` 조건 필수
- 부분 인덱스(`WHERE is_deleted = FALSE`)로 조회 성능 보장

---

## 구현 영향

- `planning/erd/migrations/V3__soft_delete.sql` 신규 작성
- `planning/erd/PACE_ERD.md` 소프트 삭제 컬럼 반영
- 이인수 구현 시: TypeORM `@DeleteDateColumn` 또는 수동 `is_deleted` 플래그 방식 적용
