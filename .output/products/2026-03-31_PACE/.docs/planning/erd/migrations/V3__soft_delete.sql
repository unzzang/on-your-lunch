-- =============================================================================
-- PACE 소프트 삭제 스키마 추가
-- Migration  : V3__soft_delete.sql
-- DB         : PostgreSQL 16
-- Timezone   : KST 고정 저장 (DR-009 #7. UTC 미사용)
-- 작성자     : 이인수 (백엔드 개발자)
-- 설계       : 이명환 (백엔드 아키텍트)
-- 기준 문서  : planning/erd/PACE_ERD.md, PO 확정 2026-03-18
-- 작성일     : 2026-03-18
-- =============================================================================
-- 변경 내역
--   1. playlists 테이블 — is_deleted, deleted_at 컬럼 추가
--      - 사용자 생성 플레이리스트 삭제 시나리오 대응
--      - play_logs.playlist_id, review_schedules.playlist_id FK가 RESTRICT 상태이므로
--        물리 삭제 불가. 소프트 삭제로 FK 무결성 유지하면서 논리적 삭제 처리
--   2. sessions 테이블 — is_deleted, deleted_at 컬럼 추가
--      - 플레이리스트 소프트 삭제 시 하위 세션도 함께 소프트 삭제 처리 필요
--      - play_logs.session_id FK가 RESTRICT 상태이므로 물리 삭제 불가
--      - 플레이리스트 단위 소프트 삭제 트랜잭션에서 sessions도 함께 처리
--   3. 각 테이블별 부분 인덱스(Partial Index) 추가
--      - WHERE is_deleted = FALSE 조건으로 활성 데이터만 인덱스에 포함
--      - 전체 행 대비 삭제 비율이 낮은 구조이므로 부분 인덱스가 full 인덱스보다 효율적
-- =============================================================================
-- [대상 외 테이블 검토 사유]
--   users          : 이미 is_deleted + deleted_at 존재 (V1 초기 스키마 포함, AUTH-006)
--   user_playlists : 좋아요/저장 해제는 관계 해소이므로 물리 삭제가 적합.
--                    이력 보존 필요성 없음. 소프트 삭제 제외.
--   search_history : 검색어 삭제는 개인화 UX. 이력 보존 가치 없음. 소프트 삭제 제외.
--   play_logs      : 집계/복습 기준 데이터. 삭제 시나리오 없음.
--   distraction_logs, daily_stats, review_schedules, notifications 등 로그/집계류:
--                    삭제 시나리오 없음. 소프트 삭제 제외.
-- =============================================================================
-- [FK RESTRICT 유지 방침]
--   소프트 삭제 도입으로 FK를 CASCADE로 변경할 필요 없음.
--   playlists, sessions를 소프트 삭제하면 참조 행(play_logs, review_schedules)은
--   그대로 유지되며, 참조 무결성도 보존된다.
--   물리 행이 남아있는 한 RESTRICT FK는 정상 동작한다.
-- =============================================================================
-- [애플리케이션 레이어 처리 원칙 — 이인수 구현 참고]
--   1. 플레이리스트 삭제 API 호출 시:
--      BEGIN 트랜잭션
--        UPDATE playlists SET is_deleted = TRUE, deleted_at = NOW()
--          WHERE id = $playlist_id AND created_by_user_id = $user_id;
--        UPDATE sessions SET is_deleted = TRUE, deleted_at = NOW()
--          WHERE playlist_id = $playlist_id;
--      COMMIT
--   2. 모든 목록 조회 쿼리에 WHERE is_deleted = FALSE 조건 필수.
--      누락 시 소프트 삭제된 데이터가 노출되는 버그 발생.
--   3. 공식(official) 플레이리스트는 소프트 삭제 비대상.
--      API 레이어에서 creator_type = 'official'이면 삭제 요청 거부 처리.
-- =============================================================================
-- [멱등성]
--   ADD COLUMN IF NOT EXISTS 사용. 재실행 시 no-op.
--   CREATE INDEX IF NOT EXISTS 사용. 재실행 시 no-op.
-- =============================================================================


-- =============================================================================
-- 1. playlists — 소프트 삭제 컬럼 추가
-- =============================================================================

-- 소프트 삭제 플래그
-- TRUE = 논리적 삭제 상태. 목록 조회 시 WHERE is_deleted = FALSE 필터 필수
ALTER TABLE playlists
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- 삭제 요청 시각 (KST)
-- is_deleted = TRUE일 때 기록. 향후 삭제된 플레이리스트 복구/영구 삭제 배치 기준으로 활용 가능
ALTER TABLE playlists
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- 활성 플레이리스트 조회용 부분 인덱스
-- creator_type 기반 공식/사용자 플레이리스트 필터링 인덱스를 활성 데이터로 제한
CREATE INDEX IF NOT EXISTS idx_playlists_active_creator_type
    ON playlists (creator_type)
    WHERE is_deleted = FALSE;

-- 사용자 생성 플레이리스트 조회용 부분 인덱스 (Library 화면)
CREATE INDEX IF NOT EXISTS idx_playlists_active_created_by
    ON playlists (created_by_user_id)
    WHERE is_deleted = FALSE;


-- =============================================================================
-- 2. sessions — 소프트 삭제 컬럼 추가
-- =============================================================================

-- 소프트 삭제 플래그
-- playlists 소프트 삭제 트랜잭션에서 함께 처리. 독립적 세션 단위 삭제도 대응 가능
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- 삭제 요청 시각 (KST)
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- 활성 세션 조회용 부분 인덱스
-- 플레이리스트 상세 페이지 트랙 목록 조회 시 활성 세션만 반환
CREATE INDEX IF NOT EXISTS idx_sessions_active_playlist_id
    ON sessions (playlist_id, order_index)
    WHERE is_deleted = FALSE;
