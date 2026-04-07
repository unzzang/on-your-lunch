-- =============================================================================
-- PACE UK(Unique Key) 제약 추가
-- Migration  : V4__add_unique_constraints.sql
-- DB         : PostgreSQL 16
-- Timezone   : KST 고정 저장 (DR-009 #7. UTC 미사용)
-- 작성자     : 이인수 (백엔드 개발자)
-- 설계       : 이명환 (백엔드 아키텍트)
-- 기준 문서  : planning/erd/PACE_ERD.md
-- 작성일     : 2026-03-18
-- =============================================================================
-- 변경 내역
--   1. search_history (user_id, keyword) UNIQUE 제약 추가
--      - 기존 앱 레벨 upsert(중복 키 체크 → INSERT/UPDATE 분기) 방식에서
--        DB 레벨 UK 기반 ON CONFLICT 방식으로 교체
--      - UK가 없으면 동일 사용자의 동일 키워드가 복수 행으로 쌓여
--        검색 기록 목록 조회 시 중복 노출 버그 발생
--   2. daily_stats (user_id, date) UNIQUE 제약 추가
--      - play.service.ts의 raw SQL UPSERT가
--        ON CONFLICT (user_id, date) DO UPDATE 문법을 사용 중
--      - UK가 없으면 ON CONFLICT 절이 동작하지 않아 중복 행 삽입 또는
--        런타임 오류(there is no unique or exclusion constraint) 발생
-- =============================================================================
-- [PostgreSQL 16 — ADD CONSTRAINT IF NOT EXISTS 호환성 주의]
--   CHECK 제약: ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS chk_... 지원됨 (V2 참고)
--   UNIQUE 제약: ADD CONSTRAINT IF NOT EXISTS 문법이 PostgreSQL 16 기준 미지원.
--     DO $$ BEGIN ... EXCEPTION WHEN duplicate_table THEN NULL; END $$ 패턴으로
--     멱등 처리. 재실행 시 이미 존재하면 예외를 무시하고 no-op 처리.
--     (duplicate_table은 PostgreSQL에서 중복 제약 추가 시 발생하는 오류 코드임)
-- =============================================================================
-- [이인수 구현 참고 — search_history upsert]
--   UK 추가 이후 아래 패턴으로 교체 가능:
--   INSERT INTO search_history (user_id, keyword, searched_at)
--   VALUES ($1, $2, NOW())
--   ON CONFLICT (user_id, keyword)
--   DO UPDATE SET searched_at = NOW();
--   -- 동일 키워드 재검색 시 검색 시각만 갱신. 행 중복 없음.
-- =============================================================================
-- [이인수 구현 참고 — daily_stats upsert]
--   UK 추가 이후 ON CONFLICT 절이 정상 동작:
--   INSERT INTO daily_stats (user_id, date, total_study_sec, ...)
--   VALUES ($1, $2, $3, ...)
--   ON CONFLICT (user_id, date)
--   DO UPDATE SET
--     total_study_sec = daily_stats.total_study_sec + EXCLUDED.total_study_sec,
--     updated_at      = NOW();
-- =============================================================================


-- =============================================================================
-- 1. search_history — (user_id, keyword) UNIQUE 제약 추가
-- =============================================================================

-- 동일 사용자의 동일 키워드는 1행만 허용.
-- 재검색 시 searched_at만 갱신 (ON CONFLICT DO UPDATE 패턴).
-- 제약명: uq_search_history_user_keyword
DO $$
BEGIN
    ALTER TABLE search_history
        ADD CONSTRAINT uq_search_history_user_keyword UNIQUE (user_id, keyword);
EXCEPTION
    WHEN duplicate_table THEN
        -- 제약이 이미 존재하면 무시. 멱등 실행 보장.
        NULL;
END
$$;


-- =============================================================================
-- 2. daily_stats — (user_id, date) UNIQUE 제약 추가
-- =============================================================================

-- 사용자당 날짜별 집계 행은 1행만 허용.
-- play.service.ts ON CONFLICT (user_id, date) 문법의 전제 조건.
-- 제약명: uq_daily_stats_user_date
DO $$
BEGIN
    ALTER TABLE daily_stats
        ADD CONSTRAINT uq_daily_stats_user_date UNIQUE (user_id, date);
EXCEPTION
    WHEN duplicate_table THEN
        -- 제약이 이미 존재하면 무시. 멱등 실행 보장.
        NULL;
END
$$;
