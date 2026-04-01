-- =============================================================================
-- PACE 누락된 UK(Unique Key) 제약 추가
-- Migration  : V5__add_missing_constraints.sql
-- DB         : PostgreSQL 16
-- Timezone   : KST 고정 저장 (DR-009 #7. UTC 미사용)
-- 작성자     : 이인수 (백엔드 개발자)
-- 설계       : 이명환 (백엔드 아키텍트)
-- 기준 문서  : planning/erd/PACE_ERD.md
-- 작성일     : 2026-03-18
-- =============================================================================
-- 변경 내역
--   1. user_playlists (user_id, playlist_id, type) UNIQUE 제약 추가
--      - user-playlist.entity.ts 주석에 UK 명시되어 있었으나 실제 DB 제약 미존재.
--      - 동일 사용자가 동일 플레이리스트에 동일 type(liked/modified/recent)을
--        중복 저장하는 버그 방지.
--      - 예: type='liked' 중복 INSERT 시 단 1행만 허용.
--   2. review_schedules (user_id, session_id, interval_days) UNIQUE 제약 추가
--      - TOCTOU(Time-Of-Check-To-Time-Of-Use) 레이스 컨디션 방지.
--      - 에빙하우스 복습 스케줄 생성 시 동일 (사용자, 세션, 간격)에 대해
--        복수 요청이 동시에 들어올 경우 중복 행 삽입 위험 제거.
--      - ON CONFLICT DO NOTHING INSERT 패턴의 전제 조건.
-- =============================================================================
-- [PostgreSQL 16 — ADD CONSTRAINT IF NOT EXISTS 호환성 주의]
--   CHECK 제약: ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS chk_... 지원됨 (V2 참고)
--   UNIQUE 제약: ADD CONSTRAINT IF NOT EXISTS 문법이 PostgreSQL 16 기준 미지원.
--     DO $$ BEGIN ... EXCEPTION WHEN duplicate_table THEN NULL; END $$ 패턴으로
--     멱등 처리. 재실행 시 이미 존재하면 예외를 무시하고 no-op 처리.
--     (duplicate_table은 PostgreSQL에서 중복 제약 추가 시 발생하는 오류 코드임)
-- =============================================================================
-- [이인수 구현 참고 — user_playlists INSERT 패턴]
--   UK 추가 이후 중복 liked/recent 저장 방지 패턴:
--   INSERT INTO user_playlists (user_id, playlist_id, type, saved_at)
--   VALUES ($1, $2, $3, NOW())
--   ON CONFLICT (user_id, playlist_id, type)
--   DO UPDATE SET saved_at = NOW();
--   -- 동일 (user_id, playlist_id, type) 재저장 시 saved_at만 갱신. 행 중복 없음.
-- =============================================================================
-- [이인수 구현 참고 — review_schedules INSERT 패턴]
--   UK 추가 이후 레이스 컨디션 안전한 패턴:
--   INSERT INTO review_schedules (user_id, session_id, interval_days, review_date, status)
--   VALUES ($1, $2, $3, $4, 'pending')
--   ON CONFLICT (user_id, session_id, interval_days)
--   DO NOTHING;
--   -- 이미 스케줄이 존재하면 무시. 재생성 요청 중복 실행 시 안전.
-- =============================================================================


-- =============================================================================
-- 1. user_playlists — (user_id, playlist_id, type) UNIQUE 제약 추가
-- =============================================================================

-- 동일 사용자의 동일 플레이리스트 + 동일 type 조합은 1행만 허용.
-- user-playlist.entity.ts 주석 "UK: (user_id, playlist_id, type)"의 DB 레벨 구현.
-- 제약명: uq_user_playlists_user_playlist_type
DO $$
BEGIN
    ALTER TABLE user_playlists
        ADD CONSTRAINT uq_user_playlists_user_playlist_type UNIQUE (user_id, playlist_id, type);
EXCEPTION
    WHEN duplicate_table THEN
        -- 제약이 이미 존재하면 무시. 멱등 실행 보장.
        NULL;
END
$$;


-- =============================================================================
-- 2. review_schedules — (user_id, session_id, interval_days) UNIQUE 제약 추가
-- =============================================================================

-- 동일 (사용자, 세션, 복습 간격) 조합은 1행만 허용.
-- 에빙하우스 1/3/7일 간격 스케줄이 레이스 컨디션으로 중복 생성되는 것을 방지.
-- ON CONFLICT (user_id, session_id, interval_days) DO NOTHING 패턴의 전제 조건.
-- 제약명: uq_review_schedules_user_session_interval
DO $$
BEGIN
    ALTER TABLE review_schedules
        ADD CONSTRAINT uq_review_schedules_user_session_interval UNIQUE (user_id, session_id, interval_days);
EXCEPTION
    WHEN duplicate_table THEN
        -- 제약이 이미 존재하면 무시. 멱등 실행 보장.
        NULL;
END
$$;
