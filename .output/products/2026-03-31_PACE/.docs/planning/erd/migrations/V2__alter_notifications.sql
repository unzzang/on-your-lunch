-- =============================================================================
-- PACE 알림 관련 스키마 변경
-- Migration  : V2__alter_notifications.sql
-- DB         : PostgreSQL 16
-- Timezone   : KST 고정 저장 (DR-009 #7. UTC 미사용)
-- 작성자     : 이인수 (백엔드 개발자)
-- 설계       : 이명환 (백엔드 아키텍트)
-- 기준 문서  : planning/tech-spec/backend.md 7절, DR-011
-- 작성일     : 2026-03-18
-- 수정일     : 2026-03-18 (MySQL → PostgreSQL 16 전환)
-- =============================================================================
-- 변경 내역
--   1. notification_log_sync_records 테이블 신규 생성
--      - 클라이언트 로컬 알림 발동 기록 동기화 저장소 (NOTI-002-A, NOTI-002-E)
--      - notifications 테이블(서버 발송 로그)과 분리하여 FCM 크론 중복 발송 방지 로직 오염 차단
--   2. device_tokens.is_fcm_fallback_active 컬럼 추가
--      - iOS 64개 로컬 알림 슬롯 한도 초과 시 FCM fallback 전환 여부 (NOTI-002-D)
--   3. notification_settings 컬럼 3개 추가
--      - learning_reminder_enabled : 학습 리마인더 ON/OFF (NOTI-002-B, 모닝콜과 독립)
--      - weekly_report_day         : 주간 리포트 발송 요일 (클라이언트 로컬 알림 예약 기준, DR-011)
--      - weekly_report_time        : 주간 리포트 발송 시각 (클라이언트 로컬 알림 예약 기준, DR-011)
-- =============================================================================
-- [변환 주의사항]
--   - SET FOREIGN_KEY_CHECKS: 제거. PostgreSQL은 ALTER TABLE ... ADD CONSTRAINT 시
--     기존 데이터 검증만 수행. 미참조 테이블에 대한 FK 추가는 순서대로 진행하면 충분.
--   - INSERT IGNORE → INSERT ... ON CONFLICT DO NOTHING
--   - ON DUPLICATE KEY UPDATE → ON CONFLICT (...) DO UPDATE SET
--   - TINYINT(1) → BOOLEAN
--   - AFTER [column] 절: PostgreSQL은 컬럼 순서 지정 미지원. 컬럼은 항상 테이블 끝에 추가됨.
--     논리적 순서가 필요하다면 뷰 또는 SELECT 시 명시적 컬럼 순서 사용.
--   - COMMENT ON 구문: 컬럼 레벨 코멘트는 별도 COMMENT ON COLUMN으로 처리.
--     이 파일에서는 SQL 주석(--)으로 대체.
-- =============================================================================


-- =============================================================================
-- 1. notification_log_sync_records (신규 테이블)
-- 클라이언트 로컬 알림 발동 기록 동기화 저장소.
-- 대상 알림: 모닝콜(NOTI-002-A), 주간 리포트(NOTI-002-E).
--
-- [분리 이유]
-- notifications 테이블은 서버 FCM 발송 로그 전용.
-- 로컬 발동 기록을 혼재시키면 LearningReminderJob/InactiveReminderJob의
-- "오늘 미발송" EXISTS 체크 로직이 오염된다 (backend.md 1-4절 참고).
--
-- [멱등 처리]
-- UK(user_id, notification_type, fired_at) 기준
-- INSERT ... ON CONFLICT DO NOTHING으로 처리.
-- 동일 조합 재전송 시 no-op 처리 후 200 반환.
--
-- [UNIQUE KEY 명칭]
-- backend.md 7-1절 스펙에서 uq_sync(user_id, type, fired_at) 명시.
-- PostgreSQL은 예약어 충돌 없이 컬럼명 notification_type으로 선언.
-- =============================================================================
CREATE TABLE notification_log_sync_records (
    id                BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id. ON DELETE CASCADE
    user_id           BIGINT          NOT NULL,
    -- 알림 유형 코드 (NOTI-002-A=morning_call, NOTI-002-E=weekly_report)
    notification_type VARCHAR(30)     NOT NULL,
    -- 로컬 알림 실제 발동 시각 (KST). 클라이언트 ISO 8601 값을 KST로 파싱 저장
    fired_at          TIMESTAMP       NOT NULL,
    -- 서버 수신 시각 (KST)
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notification_log_sync_records PRIMARY KEY (id),
    -- 멱등 처리 기준 키: 동일 사용자/유형/발동시각 중복 방지
    CONSTRAINT uq_sync UNIQUE (user_id, notification_type, fired_at),
    CONSTRAINT fk_nlsr_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

-- 사용자별 동기화 기록 조회용 인덱스
CREATE INDEX idx_nlsr_user_id ON notification_log_sync_records (user_id);

-- [이인수 구현 참고] 멱등 INSERT 예시:
-- INSERT INTO notification_log_sync_records (user_id, notification_type, fired_at)
-- VALUES ($1, $2, $3)
-- ON CONFLICT (user_id, notification_type, fired_at) DO NOTHING;


-- =============================================================================
-- 2. device_tokens 컬럼 추가: is_fcm_fallback_active
-- iOS 로컬 알림 슬롯(최대 64개) 부족 시 FCM fallback 전환 여부.
--
-- [활성화 흐름]
--   클라이언트 로컬 알림 예약 수 50개 초과 감지
--   → POST /api/v1/notifications/fcm-fallback-request { active: true }
--   → 해당 device_tokens 행의 is_fcm_fallback_active = TRUE 업데이트
--   → ReviewFcmFallbackJob이 is_fcm_fallback_active = TRUE 기기에만 FCM 발송
--
-- [리셋 조건]
--   FCM 토큰 갱신(onTokenRefresh) 시 신규 토큰 UPSERT → 기본값 FALSE로 시작.
--   클라이언트가 로컬 슬롯 확보 후 active: false 요청 시 FALSE로 명시 업데이트.
--
-- [Android 해당 없음]
--   Android는 로컬 알림 64개 한도 없음. 클라이언트가 platform=ios 기기에서만 호출.
--   서버는 platform 구분 없이 값만 갱신 (클라이언트 책임).
--
-- [PostgreSQL 변환 주의]
--   TINYINT(1) DEFAULT 0 → BOOLEAN DEFAULT FALSE
--   AFTER [column] 절 미지원. 컬럼은 테이블 끝에 추가됨.
--
-- [V1 포함 여부]
--   V1__init_schema.sql에서 device_tokens 테이블 생성 시 is_fcm_fallback_active 컬럼을
--   초기 스키마에 포함시켰다. 따라서 이 마이그레이션은 V1 이후 별도로 적용되는 환경
--   (예: V1 이전 MySQL 스키마에서 PostgreSQL로 전환하는 경우)에만 실행한다.
--   V1부터 적용하는 신규 환경에서는 이 ALTER TABLE 구문을 건너뛰어야 한다.
--   IF NOT EXISTS를 사용하여 멱등 처리한다.
-- =============================================================================
ALTER TABLE device_tokens
    ADD COLUMN IF NOT EXISTS is_fcm_fallback_active BOOLEAN NOT NULL DEFAULT FALSE;


-- =============================================================================
-- 3. notification_settings 컬럼 3개 추가
-- [PostgreSQL 변환 주의] AFTER [column] 절 미지원. 컬럼은 테이블 끝에 추가됨.
-- [V1 포함 여부] V1__init_schema.sql에서 notification_settings 테이블 생성 시
--   learning_reminder_enabled, weekly_report_day, weekly_report_time 컬럼이
--   이미 포함되어 있다. ADD COLUMN IF NOT EXISTS를 사용하여 멱등 처리한다.
--   신규 환경(V1부터 적용)에서는 이 ALTER TABLE 구문들이 no-op 처리된다.
-- =============================================================================

-- 3-1. learning_reminder_enabled
-- 학습 리마인더(NOTI-002-B) ON/OFF.
-- morning_call_enabled(NOTI-002-A)와 독립 제어 (DR-010 #2 확정).
-- LearningReminderJob 쿼리에서 이 컬럼으로 대상 사용자 필터링.
ALTER TABLE notification_settings
    ADD COLUMN IF NOT EXISTS learning_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 3-2. weekly_report_day
-- 주간 리포트 발송 요일 (0=일요일 ... 6=토요일).
-- 클라이언트 로컬 알림 예약 기준 데이터. 서버 크론 잡 불필요(DR-011).
-- MVP 고정값: 0 (일요일). 이후 사용자 설정 기능 추가 시 PATCH 엔드포인트에 포함.
-- [주의] CHECK 제약 별도 추가 (0~6 범위 검증)
ALTER TABLE notification_settings
    ADD COLUMN IF NOT EXISTS weekly_report_day SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE notification_settings
    ADD CONSTRAINT IF NOT EXISTS chk_weekly_report_day CHECK (weekly_report_day BETWEEN 0 AND 6);

-- 3-3. weekly_report_time
-- 주간 리포트 발송 시각 (KST).
-- 클라이언트 로컬 알림 예약 기준 데이터. 서버 크론 잡 불필요(DR-011).
-- MVP 고정값: '20:00:00'. 이후 사용자 설정 기능 추가 시 PATCH 엔드포인트에 포함.
ALTER TABLE notification_settings
    ADD COLUMN IF NOT EXISTS weekly_report_time TIME NOT NULL DEFAULT '20:00:00';
