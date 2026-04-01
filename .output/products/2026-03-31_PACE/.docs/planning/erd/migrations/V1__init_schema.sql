-- =============================================================================
-- PACE 데이터베이스 초기 스키마
-- Migration  : V1__init_schema.sql
-- DB         : PostgreSQL 16
-- Timezone   : KST 고정 저장 (DR-009 #7. UTC 미사용)
--              세션 레벨: SET timezone = 'Asia/Seoul'
--              RDS 파라미터 그룹: timezone = Asia/Seoul (권장)
-- 작성자     : 이인수 (백엔드 개발자)
-- 설계       : 이명환 (백엔드 아키텍트)
-- 기준 문서  : planning/erd/PACE_ERD.md, DR-009, DR-010
-- 작성일     : 2026-03-18
-- 수정일     : 2026-03-18 (MySQL → PostgreSQL 16 전환)
-- =============================================================================
-- [변환 주의사항]
--   - ENUM 타입: CREATE TYPE으로 선언 후 컬럼에 사용. 타입 재사용 가능.
--   - BIGINT UNSIGNED AUTO_INCREMENT → BIGINT GENERATED ALWAYS AS IDENTITY
--   - ON UPDATE NOW() → 트리거(set_updated_at)로 처리. 모든 updated_at 컬럼에 적용.
--   - TINYINT(1) → BOOLEAN
--   - DATETIME → TIMESTAMP
--   - INT UNSIGNED / SMALLINT UNSIGNED → INT / SMALLINT (PostgreSQL은 UNSIGNED 미지원)
--   - TINYINT UNSIGNED (order_index, duration) → SMALLINT
--   - SET FOREIGN_KEY_CHECKS: 불필요. PostgreSQL은 트랜잭션 내 FK 검사 지연 지원
--     (SET CONSTRAINTS ALL DEFERRED). 본 스크립트는 참조 순서대로 생성하므로 불필요.
--   - ENGINE=InnoDB / CHARSET / COLLATE: 제거
--   - COMMENT 구문: 컬럼 레벨 COMMENT는 PostgreSQL에서 별도 COMMENT ON COLUMN으로 처리.
--     이 파일에서는 SQL 주석(--)으로 대체. (flyway 마이그레이션 가독성 유지 목적)
-- =============================================================================

-- =============================================================================
-- ENUM 타입 선언
-- PostgreSQL ENUM은 한 번 선언 후 여러 테이블에서 재사용 가능.
-- 값 추가는 ALTER TYPE ... ADD VALUE로 가능. 값 삭제/순서 변경은 타입 재생성 필요.
-- =============================================================================

CREATE TYPE exam_type_enum AS ENUM (
    'suneung',
    'civil_service',
    'certification',
    'language',
    'transfer',
    'other'
);

CREATE TYPE daily_hours_enum AS ENUM (
    '1-2h',
    '3-4h',
    '5-6h',
    '7h+'
);

CREATE TYPE social_provider_enum AS ENUM (
    'google',
    'apple',
    'kakao'
);

CREATE TYPE creator_type_enum AS ENUM (
    'official',
    'user'
);

CREATE TYPE session_type_enum AS ENUM (
    'study',
    'rest'
);

CREATE TYPE user_playlist_type_enum AS ENUM (
    'liked',
    'modified',
    'recent'
);

CREATE TYPE play_log_status_enum AS ENUM (
    'completed',
    'incomplete',
    'skipped'
);

CREATE TYPE review_type_enum AS ENUM (
    '1d',
    '3d',
    '7d'
);

CREATE TYPE review_status_enum AS ENUM (
    'pending',
    'notified',
    'completed',
    'skipped'
);

CREATE TYPE notification_type_enum AS ENUM (
    'session_start',
    'session_end',
    'review',
    'retention_morning',
    'retention_inactive',
    'weekly_report'
);


-- =============================================================================
-- updated_at 자동 갱신 트리거 함수
-- MySQL의 ON UPDATE NOW()를 대체한다.
-- 모든 updated_at 컬럼 보유 테이블에 트리거를 별도 생성해야 한다.
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- 1. users
-- 사용자 계정 마스터 테이블.
-- 소프트 딜리트 적용 (is_deleted / deleted_at). AUTH-006 7일 유예 복구 정책.
-- =============================================================================
CREATE TABLE users (
    id                   BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- 전체 계정 식별 기준 UK. Apple 릴레이 이메일 포함
    email                VARCHAR(254)    NOT NULL,
    -- 이메일 가입: 입력값 / Apple 첫 로그인 시 즉시 저장
    name                 VARCHAR(50)     NOT NULL,
    -- 소셜 전용 계정은 NULL
    password_hash        VARCHAR(255)        NULL DEFAULT NULL,
    -- 온보딩 스킵 시 NULL
    exam_type            exam_type_enum      NULL DEFAULT NULL,
    -- 시험 D-Day. KST 기준. 온보딩 스킵 시 NULL
    d_day                DATE                NULL DEFAULT NULL,
    -- 하루 가용 학습 시간 구간
    daily_hours          daily_hours_enum    NULL DEFAULT NULL,
    -- 온보딩 완료 여부
    onboarding_completed BOOLEAN         NOT NULL DEFAULT FALSE,
    -- 마케팅 수신 동의 여부
    marketing_agreed     BOOLEAN         NOT NULL DEFAULT FALSE,
    -- 소프트 딜리트 플래그. 탈퇴 요청 시 TRUE로 변경
    is_deleted           BOOLEAN         NOT NULL DEFAULT FALSE,
    -- 탈퇴 요청 시각 (KST). 7일 경과 후 배치로 물리 삭제
    deleted_at           TIMESTAMP           NULL DEFAULT NULL,
    -- 계정 생성 시각 (KST)
    created_at           TIMESTAMP       NOT NULL DEFAULT NOW(),
    -- 최종 수정 시각 (KST). 트리거 fn_set_updated_at으로 자동 갱신
    updated_at           TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
);

-- 탈퇴 배치 잡: is_deleted=TRUE AND deleted_at < NOW() - INTERVAL '7 days' 조건으로 물리 삭제
CREATE INDEX idx_users_is_deleted_deleted_at ON users (is_deleted, deleted_at);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- 2. social_accounts
-- 소셜 로그인 연동 정보. users:social_accounts = 1:N.
-- DR-010 #1: Apple sub ID는 이 테이블의 provider_user_id에만 저장.
--            users.apple_sub_id 컬럼 미사용 (PO 확정).
-- =============================================================================
CREATE TABLE social_accounts (
    id               BIGINT              NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id          BIGINT              NOT NULL,
    -- 소셜 로그인 제공자
    provider         social_provider_enum NOT NULL,
    -- 소셜 플랫폼 고유 사용자 ID. Apple의 경우 sub 값
    provider_user_id VARCHAR(255)        NOT NULL,
    -- 소셜 제공 이메일. Apple 릴레이 이메일 포함. nullable
    email            VARCHAR(254)            NULL DEFAULT NULL,
    -- 소셜 연동 시각 (KST)
    connected_at     TIMESTAMP           NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_social_accounts PRIMARY KEY (id),
    -- 동일 소셜 계정의 중복 연동 방지
    CONSTRAINT uk_social_accounts_provider_uid UNIQUE (provider, provider_user_id),
    CONSTRAINT fk_social_accounts_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_social_accounts_user_id ON social_accounts (user_id);


-- =============================================================================
-- 3. playlists
-- 공식(official) 및 사용자 생성(user) 플레이리스트.
-- original_playlist_id: 공식 플레이리스트 수정 복사 시 원본 참조.
-- =============================================================================
CREATE TABLE playlists (
    id                   BIGINT              NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- 플레이리스트 제목
    title                VARCHAR(100)        NOT NULL,
    -- 설명
    description          TEXT                    NULL DEFAULT NULL,
    -- 커버 이미지 URL
    cover_image_url      VARCHAR(500)            NULL DEFAULT NULL,
    -- 총 길이 (분). 세션 duration 합계와 정합성 유지 필요
    total_duration       INT                 NOT NULL,
    -- official=운영팀 생성 / user=사용자 생성 또는 수정
    creator_type         creator_type_enum   NOT NULL,
    -- FK → users.id. official 플레이리스트는 NULL
    created_by_user_id   BIGINT                  NULL DEFAULT NULL,
    -- 공식 플레이리스트를 사용자가 수정한 복사본 여부
    is_modified_copy     BOOLEAN             NOT NULL DEFAULT FALSE,
    -- FK → playlists.id. 복사 원본 플레이리스트 ID
    original_playlist_id BIGINT                  NULL DEFAULT NULL,
    -- 누적 재생 수
    play_count           INT                 NOT NULL DEFAULT 0,
    -- 생성 시각 (KST)
    created_at           TIMESTAMP           NOT NULL DEFAULT NOW(),
    -- 최종 수정 시각 (KST). 트리거 fn_set_updated_at으로 자동 갱신
    updated_at           TIMESTAMP           NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_playlists PRIMARY KEY (id),
    -- created_by_user_id: 사용자 탈퇴 시 플레이리스트는 유지(SET NULL). 공식 콘텐츠 보호 목적.
    CONSTRAINT fk_playlists_created_by_user_id
        FOREIGN KEY (created_by_user_id) REFERENCES users (id)
        ON DELETE SET NULL,
    -- original_playlist_id: 원본 삭제 시 복사본 연결만 해제(SET NULL). 복사본 자체는 유지.
    CONSTRAINT fk_playlists_original_playlist_id
        FOREIGN KEY (original_playlist_id) REFERENCES playlists (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_playlists_creator_type ON playlists (creator_type);
CREATE INDEX idx_playlists_created_by_user_id ON playlists (created_by_user_id);
CREATE INDEX idx_playlists_original_playlist_id ON playlists (original_playlist_id);

CREATE TRIGGER trg_playlists_updated_at
    BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- 4. playlist_exam_types
-- 플레이리스트-시험유형 M:N 연결 테이블.
-- exam_type 복수 태깅 지원. JSON/콤마 분리 방식 불채택(조회 성능·정합성 이유).
-- =============================================================================
CREATE TABLE playlist_exam_types (
    id          BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → playlists.id
    playlist_id BIGINT          NOT NULL,
    -- 시험 유형
    exam_type   exam_type_enum  NOT NULL,

    CONSTRAINT pk_playlist_exam_types PRIMARY KEY (id),
    -- 동일 플레이리스트에 동일 exam_type 중복 태깅 방지
    CONSTRAINT uk_playlist_exam_types_pid_type UNIQUE (playlist_id, exam_type),
    CONSTRAINT fk_playlist_exam_types_playlist_id
        FOREIGN KEY (playlist_id) REFERENCES playlists (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_playlist_exam_types_exam_type ON playlist_exam_types (exam_type);


-- =============================================================================
-- 5. sessions
-- 플레이리스트 내 개별 트랙(세션).
-- duration 최대 255분 → SMALLINT 충분 (PostgreSQL은 TINYINT UNSIGNED 미지원).
-- =============================================================================
CREATE TABLE sessions (
    id           BIGINT              NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → playlists.id
    playlist_id  BIGINT              NOT NULL,
    -- 플레이리스트 내 재생 순서 (1부터 시작). SMALLINT: 최대 32,767 → 충분
    order_index  SMALLINT            NOT NULL,
    -- 세션명 (예: "수학 미적분", "휴식")
    name         VARCHAR(100)        NOT NULL,
    -- 세션 유형
    session_type session_type_enum   NOT NULL,
    -- 세션 길이 (분). SMALLINT: 최대 32,767분 → 충분 (MySQL TINYINT UNSIGNED 255분과 동일 의도)
    duration     SMALLINT            NOT NULL,

    CONSTRAINT pk_sessions PRIMARY KEY (id),
    -- 동일 플레이리스트 내 순서 중복 방지
    CONSTRAINT uk_sessions_playlist_order UNIQUE (playlist_id, order_index),
    CONSTRAINT fk_sessions_playlist_id
        FOREIGN KEY (playlist_id) REFERENCES playlists (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_sessions_playlist_id ON sessions (playlist_id);


-- =============================================================================
-- 6. user_playlists
-- 사용자의 플레이리스트 저장/좋아요 관계 테이블.
-- type: liked(좋아요), modified(수정본 소유), recent(최근 재생)
-- =============================================================================
CREATE TABLE user_playlists (
    id             BIGINT                  NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id        BIGINT                  NOT NULL,
    -- FK → playlists.id
    playlist_id    BIGINT                  NOT NULL,
    -- 관계 유형
    type           user_playlist_type_enum NOT NULL,
    -- 저장/좋아요 시각 (KST)
    saved_at       TIMESTAMP               NOT NULL DEFAULT NOW(),
    -- 마지막 재생 시각 (KST)
    last_played_at TIMESTAMP                   NULL DEFAULT NULL,

    CONSTRAINT pk_user_playlists PRIMARY KEY (id),
    -- 동일 사용자/플레이리스트/타입 중복 방지
    CONSTRAINT uk_user_playlists_uid_pid_type UNIQUE (user_id, playlist_id, type),
    CONSTRAINT fk_user_playlists_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_playlists_playlist_id
        FOREIGN KEY (playlist_id) REFERENCES playlists (id)
        ON DELETE CASCADE
);

-- Library 화면: 특정 type 목록 조회
CREATE INDEX idx_user_playlists_uid_type ON user_playlists (user_id, type);
-- 최근 재생 목록 정렬
CREATE INDEX idx_user_playlists_uid_last_played ON user_playlists (user_id, last_played_at);


-- =============================================================================
-- 7. play_logs
-- 세션 단위 실행 기록. PACE 데이터 핵심 테이블.
-- playlist_id 비정규화 의도적 유지 (DR-010 #3):
--   session_id → sessions.playlist_id 경로 가능하나,
--   플레이리스트 단위 집계(복습 완료 판정, play_count 업데이트) 시
--   매 JOIN 생략 목적. 트레이드오프 수용.
-- =============================================================================
CREATE TABLE play_logs (
    id                BIGINT                  NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id           BIGINT                  NOT NULL,
    -- [비정규화] playlist_id는 sessions.playlist_id로 도달 가능하나 집계 성능을 위해 중복 저장 (DR-010 #3)
    -- FK → playlists.id. 비정규화 컬럼(DR-010)
    playlist_id       BIGINT                  NOT NULL,
    -- FK → sessions.id
    session_id        BIGINT                  NOT NULL,
    -- 세션 시작 시각 (KST)
    started_at        TIMESTAMP               NOT NULL,
    -- 세션 종료 시각 (KST). 진행 중이면 NULL
    ended_at          TIMESTAMP                   NULL DEFAULT NULL,
    -- 순공 시간 (초). 타이머 작동 시간 - 일시정지 시간
    actual_study_time INT                     NOT NULL DEFAULT 0,
    -- 배정 시간 (초). sessions.duration × 60
    assigned_time     INT                     NOT NULL,
    -- 세션 완료 상태
    status            play_log_status_enum    NOT NULL,
    -- 레코드 생성 시각 (KST)
    created_at        TIMESTAMP               NOT NULL DEFAULT NOW(),

    -- 세션 집중률은 컬럼 미저장. actual_study_time / assigned_time × 100 으로 앱/뷰 레이어에서 산출.

    CONSTRAINT pk_play_logs PRIMARY KEY (id),
    CONSTRAINT fk_play_logs_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    -- playlist_id: 플레이리스트 삭제 시 로그 유지 필요성이 있으나 ERD상 단순 FK로 처리.
    -- 실제 운영 시 플레이리스트 소프트 딜리트 정책 추가 고려 필요.
    CONSTRAINT fk_play_logs_playlist_id
        FOREIGN KEY (playlist_id) REFERENCES playlists (id),
    CONSTRAINT fk_play_logs_session_id
        FOREIGN KEY (session_id) REFERENCES sessions (id)
);

-- 일간/주간 리포트 집계용 핵심 복합 인덱스
CREATE INDEX idx_play_logs_uid_started_at ON play_logs (user_id, started_at);
CREATE INDEX idx_play_logs_user_id ON play_logs (user_id);
CREATE INDEX idx_play_logs_session_id ON play_logs (session_id);


-- =============================================================================
-- 8. distraction_logs
-- 앱 이탈/딴짓 기록.
-- raw_duration: 버퍼 30초 차감 전 실제 이탈 시간 저장.
--   조회 시: GREATEST(0, raw_duration - 30) AS effective_distraction_time
--   30초 버퍼 정책(DR-009 #2) 변경 시 DB 마이그레이션 없이 대응 가능.
-- =============================================================================
CREATE TABLE distraction_logs (
    id           BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id      BIGINT      NOT NULL,
    -- FK → play_logs.id
    play_log_id  BIGINT      NOT NULL,
    -- 앱 이탈 시각 (KST)
    left_at      TIMESTAMP   NOT NULL,
    -- 앱 복귀 시각 (KST). 미복귀 시 NULL
    returned_at  TIMESTAMP       NULL DEFAULT NULL,
    -- [버퍼 정책] raw_duration: 실제 이탈 시간(초). 버퍼 30초 차감 전 원본값.
    -- 유효 딴짓 시간 = GREATEST(0, raw_duration - 30)
    -- 진행 중(미복귀) 상태에서는 NULL
    raw_duration INT             NULL DEFAULT NULL,

    CONSTRAINT pk_distraction_logs PRIMARY KEY (id),
    CONSTRAINT fk_distraction_logs_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_distraction_logs_play_log_id
        FOREIGN KEY (play_log_id) REFERENCES play_logs (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_distraction_logs_play_log_id ON distraction_logs (play_log_id);
CREATE INDEX idx_distraction_logs_user_id ON distraction_logs (user_id);


-- =============================================================================
-- 9. daily_stats
-- 일일 학습 통계 집계 캐시 테이블.
-- total_distraction_time: 버퍼 차감 후 합산값 저장 (distraction_logs.raw_duration 기준).
-- 세션 시작일(play_logs.started_at의 날짜) 기준으로 집계 (NP-010 자정 넘김 정책).
-- =============================================================================
CREATE TABLE daily_stats (
    id                      BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id                 BIGINT          NOT NULL,
    -- 집계 날짜 (KST). play_logs.started_at 날짜 기준(NP-010)
    date                    DATE            NOT NULL,
    -- 총 순공 시간 (초)
    total_study_time        INT             NOT NULL DEFAULT 0,
    -- 총 딴짓 시간 (초). GREATEST(0, raw_duration-30) 합산값
    total_distraction_time  INT             NOT NULL DEFAULT 0,
    -- 일간 집중률(%). 순공/(순공+딴짓)×100. 분모=0이면 NULL
    focus_rate              DECIMAL(5,2)        NULL DEFAULT NULL,
    -- 완료된 학습 세션 수 (status=completed, session_type=study)
    study_sessions_count    SMALLINT        NOT NULL DEFAULT 0,
    -- 오전(05-12시) 순공 시간 (초)
    time_slot_morning       INT             NOT NULL DEFAULT 0,
    -- 오후(12-18시) 순공 시간 (초)
    time_slot_afternoon     INT             NOT NULL DEFAULT 0,
    -- 저녁(18-22시) 순공 시간 (초)
    time_slot_evening       INT             NOT NULL DEFAULT 0,
    -- 심야(22-05시) 순공 시간 (초)
    time_slot_late_night    INT             NOT NULL DEFAULT 0,
    -- 마지막 집계 갱신 시각 (KST). 트리거 fn_set_updated_at으로 자동 갱신
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_daily_stats PRIMARY KEY (id),
    -- 날짜별 중복 방지 및 단건 조회 핵심 인덱스
    CONSTRAINT uk_daily_stats_user_id_date UNIQUE (user_id, date),
    CONSTRAINT fk_daily_stats_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

-- 연속 학습일 계산용 (MyPage MP-003). PostgreSQL에서 DESC 인덱스는 명시적으로 선언 가능.
CREATE INDEX idx_daily_stats_uid_date_desc ON daily_stats (user_id, date DESC);

CREATE TRIGGER trg_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- 10. review_schedules
-- 에빙하우스 망각 곡선 기반 복습 스케줄 (1일/3일/7일 후).
-- UK(user_id, playlist_id, scheduled_date): REV-005 중복 복습 방지.
-- skipped 자동 처리: 예정일 + 2일 경과 시 배치 잡으로 status → skipped (REV-003).
-- =============================================================================
CREATE TABLE review_schedules (
    id             BIGINT              NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id        BIGINT              NOT NULL,
    -- FK → playlists.id
    playlist_id    BIGINT              NOT NULL,
    -- FK → play_logs.id. 복습 기준 세션의 마지막 완료 play_log
    play_log_id    BIGINT              NOT NULL,
    -- 복습 예정일 (KST). 완료일 + 1/3/7일(REV-001)
    scheduled_date DATE                NOT NULL,
    -- 복습 회차 유형
    review_type    review_type_enum    NOT NULL,
    -- 알림 발송 시각 (KST)
    notified_at    TIMESTAMP               NULL DEFAULT NULL,
    -- 복습 상태. 예정일+2일 경과 시 배치로 skipped 처리(REV-003)
    status         review_status_enum  NOT NULL DEFAULT 'pending',
    -- 스케줄 생성 시각 (KST)
    created_at     TIMESTAMP           NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_review_schedules PRIMARY KEY (id),
    -- REV-005: 동일 사용자/플레이리스트/날짜 중복 복습 방지
    CONSTRAINT uk_review_schedules_uid_pid_date UNIQUE (user_id, playlist_id, scheduled_date),
    CONSTRAINT fk_review_schedules_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    -- playlist_id: 플레이리스트 삭제 시 복습 스케줄 유지 정책 미결정. 현재는 RESTRICT(기본값).
    -- 운영 정책 확정 후 CASCADE 또는 SET NULL 변경 고려.
    CONSTRAINT fk_review_schedules_playlist_id
        FOREIGN KEY (playlist_id) REFERENCES playlists (id),
    CONSTRAINT fk_review_schedules_play_log_id
        FOREIGN KEY (play_log_id) REFERENCES play_logs (id)
);

-- 특정 날짜 알림 발송 배치 쿼리용
CREATE INDEX idx_review_schedules_uid_date_status ON review_schedules (user_id, scheduled_date, status);
CREATE INDEX idx_review_schedules_playlist_id ON review_schedules (playlist_id);


-- =============================================================================
-- 11. notifications
-- 발송된 푸시 알림 로그.
-- session_start/session_end: OS 푸시 로그만 저장. 앱 내 진동/알림음은 DB 저장 불필요.
-- retention_inactive 중복 방지: 배치 잡에서 마지막 발송 기록 확인(NOTI-002-C).
-- =============================================================================
CREATE TABLE notifications (
    id         BIGINT                  NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id    BIGINT                  NOT NULL,
    -- 알림 유형
    type       notification_type_enum  NOT NULL,
    -- 알림 제목
    title      VARCHAR(100)            NOT NULL,
    -- 알림 본문
    body       VARCHAR(500)            NOT NULL,
    -- 발송 시각 (KST)
    sent_at    TIMESTAMP               NOT NULL,
    -- 읽음 여부
    is_read    BOOLEAN                 NOT NULL DEFAULT FALSE,
    -- 레코드 생성 시각 (KST)
    created_at TIMESTAMP               NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

-- 알림 목록 조회 (최신순)
CREATE INDEX idx_notifications_uid_sent_at_desc ON notifications (user_id, sent_at DESC);
-- NOTI-002-C 장기 미접속 중복 발송 방지: 타입별 마지막 발송 시각 조회용
CREATE INDEX idx_notifications_uid_type_sent_at ON notifications (user_id, type, sent_at);
-- 당일 발송 기록 EXISTS 체크용 (LearningReminderJob 멱등성 보장)
-- PostgreSQL은 함수 인덱스 지원: DATE(created_at) 조건 최적화
CREATE INDEX idx_notifications_uid_type_created_at ON notifications (user_id, type, created_at);


-- =============================================================================
-- 12. notification_settings
-- 사용자별 알림 설정. users:notification_settings = 1:1.
--
-- [자동 생성 정책]
-- 신규 사용자 가입 시 기본값 행을 자동 INSERT해야 한다.
-- 처리 방법은 아래 두 가지 중 선택:
--
--   Option A — 트리거 방식 (주석 처리된 트리거 참고):
--     CREATE TRIGGER after_users_insert ...
--     장점: DB 레벨 보장. 앱 레이어 누락 방지.
--     단점: 트리거 존재가 유지보수 복잡도 증가. 테스트 환경 재현 어려움.
--
--   Option B — 앱 레이어 방식 (현재 채택):
--     회원가입 서비스 로직에서 users INSERT 직후 notification_settings INSERT 트랜잭션 처리.
--     장점: 코드 가시성. 트랜잭션 롤백 일관성.
--     단점: 앱 레이어 누락 시 설정 행 미생성 위험 → 서비스 코드 레벨에서 검증 필요.
--
-- DR-010 결정사항 반영:
--   learning_reminder_enabled: 모닝콜(morning_call_enabled)과 독립적으로 ON/OFF 가능.
--   NOTI-002-B(학습 리마인더)와 NOTI-002-A(모닝콜)는 별도 제어.
-- =============================================================================
CREATE TABLE notification_settings (
    id                        BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id. UNIQUE (1:1 관계)
    user_id                   BIGINT      NOT NULL,
    -- 전체 알림 마스터 토글. OFF 시 모든 알림 차단
    master_enabled            BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 세션 시작 알림 ON/OFF (NOTI-001-A)
    session_start_enabled     BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 세션 종료 임박 알림 ON/OFF (NOTI-001-B)
    session_end_enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 복습 알림 ON/OFF (NOTI-002-D)
    review_enabled            BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 모닝콜 ON/OFF (NOTI-002-A)
    morning_call_enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 모닝콜 시각. 30분 단위 05:00~12:00
    morning_call_time         TIME        NOT NULL DEFAULT '08:00:00',
    -- DR-010 #2: learning_reminder_enabled를 morning_call_enabled와 독립 컬럼으로 분리 (PO 확정)
    -- 학습 리마인더 ON/OFF (NOTI-002-B). 모닝콜과 독립 제어(DR-010)
    learning_reminder_enabled BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 장기 미접속 알림 ON/OFF (NOTI-002-C)
    inactive_reminder_enabled BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 주간 리포트 알림 ON/OFF (NOTI-002-E)
    weekly_report_enabled     BOOLEAN     NOT NULL DEFAULT TRUE,
    -- 주간 리포트 발송 요일 (0=일요일 ... 6=토요일). 클라이언트 로컬 알림 예약 기준(DR-011)
    weekly_report_day         SMALLINT    NOT NULL DEFAULT 0,
    -- 주간 리포트 발송 시각 (KST). 클라이언트 로컬 알림 예약 기준(DR-011)
    weekly_report_time        TIME        NOT NULL DEFAULT '20:00:00',
    -- 설정 최종 수정 시각 (KST). 트리거 fn_set_updated_at으로 자동 갱신
    updated_at                TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notification_settings PRIMARY KEY (id),
    CONSTRAINT uk_notification_settings_user_id UNIQUE (user_id),
    CONSTRAINT chk_weekly_report_day CHECK (weekly_report_day BETWEEN 0 AND 6),
    CONSTRAINT fk_notification_settings_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TRIGGER trg_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- [참고용] Option A 트리거 방식 (현재 미사용. Option B 앱 레이어 방식 채택)
-- 필요 시 아래 주석 해제하여 사용 가능.
-- CREATE OR REPLACE FUNCTION fn_after_users_insert()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     INSERT INTO notification_settings (user_id) VALUES (NEW.id);
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER trg_after_users_insert
-- AFTER INSERT ON users
-- FOR EACH ROW EXECUTE FUNCTION fn_after_users_insert();


-- =============================================================================
-- 13. search_history
-- 사용자 검색어 기록. 최근 검색어 표시 및 개인화 데이터.
-- =============================================================================
CREATE TABLE search_history (
    id          BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id     BIGINT          NOT NULL,
    -- 검색어
    keyword     VARCHAR(100)    NOT NULL,
    -- 검색 시각 (KST)
    searched_at TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_search_history PRIMARY KEY (id),
    CONSTRAINT fk_search_history_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

-- 최근 검색어 조회 (최신순)
CREATE INDEX idx_search_history_uid_searched_at_desc ON search_history (user_id, searched_at DESC);


-- =============================================================================
-- 14. refresh_tokens
-- Refresh Token 저장 테이블.
-- 기기별 로그아웃(AUTH-005), 복수 기기 지원, 토큰 무효화를 정확하게 처리하기 위해
-- users 컬럼이 아닌 별도 테이블로 분리 (DR-010).
-- =============================================================================

-- device_platform ENUM: device_tokens 테이블과 공유하기 위해 별도 선언
CREATE TYPE device_platform_enum AS ENUM (
    'ios',
    'android',
    'web'
);

CREATE TABLE refresh_tokens (
    id          BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id     BIGINT          NOT NULL,
    -- Refresh Token의 해시값. Raw 토큰은 저장하지 않는다
    token_hash  VARCHAR(255)    NOT NULL,
    -- 기기 구분용 식별 정보 (선택적). 예: "iPhone 15 / iOS 17.2"
    device_info VARCHAR(255)        NULL DEFAULT NULL,
    -- 토큰 만료 시각 (KST). 발급 시각 + 30일
    expires_at  TIMESTAMP       NOT NULL,
    -- 발급 시각 (KST)
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    -- 무효화 시각 (KST). 로그아웃/탈퇴/RTR 감지 시 기록
    revoked_at  TIMESTAMP           NULL DEFAULT NULL,

    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT fk_refresh_tokens_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

-- 사용자 단위 토큰 조회/무효화
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
-- 토큰 검증 시 단건 조회
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);


-- =============================================================================
-- 15. device_tokens
-- FCM 푸시 알림 발송을 위한 기기 토큰 저장 테이블.
-- 1 유저 N 기기 구조를 지원한다 (DR-010).
-- is_fcm_fallback_active는 V2에서 추가되나, 초기 스키마 일관성을 위해 여기서 선언.
-- =============================================================================
CREATE TABLE device_tokens (
    id                    BIGINT                  NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- FK → users.id
    user_id               BIGINT                  NOT NULL,
    -- FCM Registration Token. 앱 재설치/업데이트 시 갱신됨
    token                 VARCHAR(255)            NOT NULL,
    -- 기기 플랫폼
    platform              device_platform_enum    NOT NULL,
    -- iOS 로컬 알림 슬롯 부족 시 FCM fallback 활성화 여부 (NOTI-002-D, DR-011)
    -- V2에서 ALTER TABLE로 추가하나, 초기 스키마에 포함하여 일관성 유지
    is_fcm_fallback_active BOOLEAN                NOT NULL DEFAULT FALSE,
    -- 최초 등록 시각 (KST)
    created_at            TIMESTAMP               NOT NULL DEFAULT NOW(),
    -- 토큰 갱신 시각 (KST). 트리거 fn_set_updated_at으로 자동 갱신
    updated_at            TIMESTAMP               NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_device_tokens PRIMARY KEY (id),
    -- 동일 기기 토큰 중복 방지. UPSERT 기준 키
    CONSTRAINT uk_device_tokens_user_id_token UNIQUE (user_id, token),
    CONSTRAINT fk_device_tokens_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

-- 사용자의 모든 기기에 일괄 발송 시 사용
CREATE INDEX idx_device_tokens_user_id ON device_tokens (user_id);

CREATE TRIGGER trg_device_tokens_updated_at
    BEFORE UPDATE ON device_tokens
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
