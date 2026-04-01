# PACE 백엔드 기술 스택 & 아키텍처 명세

> 작성자: 이명환 (백엔드 아키텍트)
> 작성일: 2026-03-18
> 최종 수정: 2026-03-18 (잭 협의 3건 반영 — 알림 동기화 API, FCM fallback API, weekly_report_time 필드 추가 / DB 스택 PostgreSQL 16 전환)
> 상태: 초안 (이인수 구현 참고용)
> 연관 문서: `planning/erd/PACE_ERD.md`

---

## 1. 기술 스택 선택 근거

### 1-1. 언어 & 프레임워크

| 항목 | 선택 | 근거 |
|---|---|---|
| 언어 | **Node.js (TypeScript)** | 2인 팀(명환 + 인수) 기준 생산성 최우선. JS 생태계는 소셜 로그인(Google/Apple/Kakao), FCM, S3 SDK가 가장 성숙함. TypeScript로 타입 안전성 확보. |
| 프레임워크 | **NestJS** | 모듈/서비스/컨트롤러 3계층 구조가 강제됨 → 인수 혼자 구현 시 아키텍처 일관성 유지. DI(의존성 주입) 내장으로 테스트 용이. Express 기반이라 미들웨어 생태계 그대로 활용 가능. |

**FastAPI(Python) 미채택 이유:** Python은 AI 파이프라인(향후)에 쓸 언어이므로 API 서버와 분리하는 것이 장기적으로 맞다. 지금 Python으로 API 서버를 짜면 나중에 AI 서비스와 코드베이스가 섞여 관리가 힘들어진다.

**Spring Boot 미채택 이유:** 2인 팀에서 Java 보일러플레이트 비용이 너무 크다. MVP 속도를 맞출 수 없다.

---

### 1-2. ORM / 쿼리 빌더

| 항목 | 선택 | 근거 |
|---|---|---|
| ORM | **TypeORM** | NestJS와 공식 통합. TypeScript 데코레이터 기반으로 ERD 스키마를 코드로 직접 표현 가능. 마이그레이션 CLI 내장. |
| 보조 쿼리 | **직접 QueryBuilder 사용** | 복잡한 집계 쿼리(daily_stats UPSERT, 연속 학습일 계산, 집중률 통계)는 TypeORM QueryBuilder로 작성. ORM으로 억지로 풀지 않는다. |

**Prisma 미채택 이유:** Prisma는 스키마 파일(prisma.schema)이 SSoT(Single Source of Truth)가 되어야 하는데, 이미 ERD가 확정된 프로젝트에서는 오히려 이중 관리가 된다. TypeORM은 기존 DB에 Entity를 맞추는 방식(기존 스키마 우선)이 자연스럽다.

---

### 1-3. 인증 방식

JWT 정책은 이미 확정됨. 구현 레벨 결정만 기록.

| 항목 | 결정 |
|---|---|
| Access Token | JWT, 만료 30분 |
| Access Token 전달 방식 | **`Authorization: Bearer {token}` 헤더** (PO 확정, DR-010) |
| Refresh Token | JWT, 만료 30일. `refresh_tokens` 별도 테이블에 해시값 저장 (PO 확정, DR-010). |
| 소셜 로그인 | **passport-google-oauth20**, **passport-apple**, **카카오 REST API** (passport 미존재, 직접 구현) |
| NestJS 통합 | `@nestjs/passport` + `@nestjs/jwt` |
| 토큰 갱신 | Refresh Token Rotation 적용. 재사용 감지 시 해당 사용자 전체 세션 무효화. |

**Access Token 헤더 규격 (이인수 구현 기준):**

모든 인증이 필요한 API 요청에 아래 형식으로 Access Token을 포함한다. 쿼리 파라미터 방식은 허용하지 않는다.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- NestJS `JwtAuthGuard`가 전역 적용됨. 인증 불필요 엔드포인트에는 `@Public()` 데코레이터 사용.
- 토큰 만료 시 `401 Unauthorized` 반환 → 클라이언트가 Refresh Token으로 재발급 요청.
- Refresh Token 엔드포인트(`POST /auth/refresh`)는 `@Public()` 처리.

> **이인수 참고:** Refresh Token은 1 유저 N행 구조로 `refresh_tokens` 테이블에 저장한다 (복수 기기 지원). 로그아웃 시 해당 기기 토큰의 `revoked_at`을 기록하고, RTR 재사용 감지 시 해당 `user_id`의 전체 행을 일괄 무효화한다. ERD `refresh_tokens` 테이블 설계 주석 참고.

---

### 1-4. 배치 잡 처리

| 항목 | 선택 | 근거 |
|---|---|---|
| 스케줄러 | **@nestjs/schedule** (node-cron 래퍼) | NestJS 생태계 내 표준. 별도 서비스 추가 없이 API 서버에 내장 가능. MVP 규모에서 외부 큐(BullMQ 등) 오버킬. |

**알림 처리 방식 분류 (DR-011 확정):**

| 알림 유형 | NOTI 코드 | 처리 방식 | 서버 역할 |
|---|---|---|---|
| 모닝콜 | NOTI-002-A | **클라이언트 로컬 알림** | 없음 (크론 잡 제거) |
| 학습 리마인더 | NOTI-002-B | **서버 FCM** | 매분 크론, 상태 기반 FCM 발송 유지 |
| 장기 미접속 | NOTI-002-C | **서버 FCM** | 매일 크론, 상태 기반 FCM 발송 유지 |
| 복습 알림 | NOTI-002-D | **하이브리드** | 스케줄 API 응답에 `scheduled_date` 포함 → 클라이언트 로컬 예약. iOS 64개 한도 초과 케이스만 서버 FCM fallback |
| 주간 리포트 | NOTI-002-E | **클라이언트 로컬 알림** | 없음 (크론 잡 제거) |

**배치 잡 목록 (이인수 구현 대상, DR-011 반영):**

| 잡 이름 | 실행 주기 | 작업 내용 |
|---|---|---|
| `ReviewSkipJob` | 매일 00:10 KST | `review_schedules`에서 `scheduled_date + 2일 경과 & status = pending` → `skipped` 일괄 업데이트 (REV-003) |
| `UserHardDeleteJob` | 매일 02:00 KST | `users`에서 `is_deleted = true & deleted_at + 7일 경과` → 물리 삭제 (AUTH-006 탈퇴 유예 정책) |
| `LearningReminderJob` | **매분 실행** (`* * * * *`) | 모닝콜 시각 + 2시간 경과 & 오늘 `play_logs` 없음 → FCM 발송 (NOTI-002-B). 쿼리 윈도우 설계 아래 참고. |
| `InactiveReminderJob` | 매일 10:00 KST | 마지막 접속 2/5/7일 기준 단계별 푸시 (NOTI-002-C). 매일 1회 실행이므로 중복 발송 방지는 당일 발송 여부 플래그로 처리. |
| `ReviewFcmFallbackJob` | 매일 09:00 KST | iOS 64개 한도 초과 사용자에 한해 복습 알림 FCM 발송 (NOTI-002-D fallback). 일반 케이스는 클라이언트 로컬 예약으로 처리. |
| `DailyStatsUpsertJob` | 매일 00:05 KST | 전날 `play_logs` 기반으로 `daily_stats` UPSERT (집계 보정용 야간 배치) |

> **제거된 잡 (DR-011):** `MorningCallJob` (NOTI-002-A → 로컬 알림 전환), `WeeklyReportJob` (NOTI-002-E → 로컬 알림 전환), `ReviewNotificationJob` (NOTI-002-D → 하이브리드 방식으로 대체, FCM 발송 잡 대신 `ReviewFcmFallbackJob`으로 한도 초과 케이스만 처리).

---

#### FCM 크론 쿼리 윈도우 설계 (잭 지적 사항 반영, DR-011)

매분 실행 크론(`LearningReminderJob`)에서 **2분 오차 발생 원인**은 크론 실행 시각과 `scheduled_date` 비교 기준이 불일치할 때 발생한다. 아래 방식으로 설계한다.

**설계 원칙: `is_notified` 플래그 + 시간 범위 필터 조합**

단순히 `WHERE scheduled_date BETWEEN :lastRun AND :now` 방식은 `:lastRun`이 부정확할 경우 누락 또는 중복이 발생한다. 아래 방식을 사용한다.

```sql
-- LearningReminderJob 쿼리 예시
SELECT u.id, u.fcm_token
FROM notification_settings ns
JOIN users u ON u.id = ns.user_id
WHERE ns.learning_reminder_enabled = true
  AND ns.morning_call_time + INTERVAL 2 HOUR <= NOW()   -- 리마인더 발송 기준 시각 도래
  AND DATE(NOW()) = CURDATE()                            -- 오늘 날짜 한정
  AND NOT EXISTS (
    SELECT 1 FROM play_logs pl
    WHERE pl.user_id = u.id
      AND DATE(pl.started_at) = CURDATE()               -- 오늘 학습 기록 없음
  )
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.id
      AND n.type = 'learning_reminder'
      AND DATE(n.created_at) = CURDATE()                -- 오늘 이미 발송하지 않음
  )
```

**핵심 설계 결정:**

- `is_notified` 방식 대신 `notifications` 테이블의 **당일 발송 기록 존재 여부**로 중복 발송을 방지한다. 별도 플래그 컬럼 추가 없이 `notifications` 테이블이 발송 로그 역할을 겸한다.
- `BETWEEN :lastRun AND :now` 슬라이딩 윈도우는 **사용하지 않는다.** 크론 실행 지연/중복 시 오차가 누적되기 때문이다. 대신 "오늘 날짜 + 조건 충족 + 미발송" 조합으로 멱등성(idempotent)을 보장한다.
- `LearningReminderJob`은 매분 실행되더라도 당일 발송 기록이 있으면 쿼리 결과가 0건이 되어 FCM 발송이 일어나지 않는다. **자동으로 중복 방지.**

> **이인수 참고:** `notifications` 테이블에 `(user_id, type, DATE(created_at))` 기준 복합 인덱스를 추가해야 위 EXISTS 서브쿼리가 빠르게 동작한다. ERD 설계 시 반영 요청. `InactiveReminderJob`도 동일한 패턴(당일 발송 기록 EXISTS 체크)으로 구현한다.

> **설계 주석 — MorningCallJob 제거 배경 (DR-011):** 모닝콜(NOTI-002-A)은 고정 시각 알림으로 서버 상태와 무관하다. 클라이언트 로컬 알림으로 충분히 구현 가능하며, 서버 크론 + FCM 경유는 불필요한 인프라 비용이다. 단, 클라이언트가 앱 실행 시 `notification_settings`의 `morning_call_time`을 서버에서 동기화하여 로컬 예약을 갱신해야 한다. 잭과 구현 협의 필요.

> **설계 주석 — LearningReminderJob 실행 주기 (PO 확정, DR-010 유지):** **매분 실행** (`* * * * *`) 유지. 매분 폴링 방식은 사용자 수 증가 시 부하가 선형으로 증가하므로, 일정 규모 이상에서 BullMQ + Redis 기반 지연 큐로 전환한다. 전환 기준은 별도 협의 예정.

---

### 1-5. 푸시 알림

| 항목 | 선택 | 근거 |
|---|---|---|
| 서비스 | **Firebase Cloud Messaging (FCM)** | iOS/Android 크로스 플랫폼 단일 인터페이스. Google 관리 인프라로 안정성 보장. |
| SDK | **firebase-admin (Node.js)** | 서버 사이드 FCM 발송 공식 SDK. |
| 토큰 관리 | 기기 FCM 토큰을 `device_tokens` 별도 테이블에 저장 | 1 유저 N 기기 지원. ERD 15번 테이블로 추가 완료 (DR-010). |

> **`device_tokens` 테이블 ERD 반영 완료 (DR-010):** `planning/erd/PACE_ERD.md` 15번 테이블 참고. 컬럼 구성: `id`, `user_id`(FK CASCADE), `token` VARCHAR(255), `platform` ENUM(`ios`,`android`,`web`), `created_at`, `updated_at`. UK: `(user_id, token)`.

---

### 1-6. 파일 스토리지 (커버 이미지)

| 항목 | 선택 | 근거 |
|---|---|---|
| 스토리지 | **AWS S3** | 정적 파일 서빙 표준. CloudFront CDN 붙이면 이미지 응답 속도 보장. |
| 업로드 방식 | **Pre-signed URL** | 클라이언트가 서버를 경유하지 않고 S3에 직접 업로드. 서버 트래픽/처리 비용 절감. |
| 이미지 처리 | **Sharp (Node.js) 또는 S3 Trigger → Lambda** | 업로드 시 리사이징(썸네일 생성). MVP에서는 Sharp로 서버 사이드 처리, 이후 Lambda로 분리 고려. |
| CDN | **AWS CloudFront** | S3 앞단에 붙여 이미지 캐싱 및 전세계(국내) 응답 속도 개선. |

---

### 1-7. 배포 인프라

MVP 규모(국내 단일, 소규모 사용자) 기준으로 **단순하고 관리 비용이 낮은 구성**을 우선한다.

| 항목 | 선택 | 근거 |
|---|---|---|
| 클라우드 | **AWS** | S3/CloudFront/RDS 연동이 자연스럽다. 국내 서비스라면 ap-northeast-2(서울 리전) 사용. |
| 컨테이너 | **Docker + Docker Compose** | 로컬 개발 환경 통일. 운영은 단일 EC2에서 Compose로 실행. |
| 서버 | **AWS EC2 (t3.small 또는 t3.medium)** | MVP 트래픽 수준에서 ECS/EKS는 오버킬. EC2 단일 인스턴스로 시작. 스케일 필요 시 ALB + Auto Scaling으로 전환. |
| DB | **AWS RDS PostgreSQL 16** | ERD 확정 기준. `db.t3.micro`로 시작. Multi-AZ는 서비스 안정화 후 적용. KST 타임존 설정 필수 (RDS 파라미터 그룹: `timezone = Asia/Seoul`). |
| 리버스 프록시 | **Nginx** | EC2 위에서 Nginx → NestJS 프로세스로 프록시. SSL 종료(Let's Encrypt or ACM). |
| 프로세스 관리 | **PM2** (Docker 없이 갈 경우 대안) 또는 **Docker Compose** | Docker Compose 사용 시 PM2 불필요. |
| CI/CD | **GitHub Actions** | 코드 푸시 → 테스트 → Docker 빌드 → EC2 배포. 2인 팀에서 Jenkins/CircleCI는 설정 비용 과다. |
| 환경 변수 관리 | **AWS Parameter Store** 또는 `.env` (초기) | 초기에는 `.env` 파일로 시작, 이후 Parameter Store로 이관. |
| 로그 | **AWS CloudWatch Logs** | EC2/컨테이너 로그 중앙화. 별도 ELK 스택 불필요. |

---

## 2. 백엔드 디렉토리 구조

NestJS 기반, 도메인 모듈 구조.

```
pace-api/
├── src/
│   ├── main.ts                          # 앱 엔트리포인트. NestFactory.create()
│   ├── app.module.ts                    # 루트 모듈. 전체 모듈 조립
│   │
│   ├── config/                          # 환경 설정
│   │   ├── database.config.ts           # TypeORM DataSource 설정 (PostgreSQL, KST timezone)
│   │   ├── jwt.config.ts                # JWT secret, expiration 설정
│   │   ├── firebase.config.ts           # firebase-admin 초기화
│   │   └── s3.config.ts                 # AWS S3 클라이언트 설정
│   │
│   ├── common/                          # 공통 유틸리티
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts    # @CurrentUser() 커스텀 데코레이터
│   │   │   └── public.decorator.ts          # @Public() — JWT Guard 예외 처리용
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts     # 전역 예외 필터 (표준 에러 응답 포맷)
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts            # 전역 JWT 인증 가드
│   │   │   └── roles.guard.ts               # 관리자/사용자 권한 분리
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts      # 표준 응답 래퍼 { success, data, message }
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts           # class-validator 기반 DTO 검증
│   │   └── utils/
│   │       ├── date.util.ts                 # KST 날짜 계산 유틸 (dayjs 기반)
│   │       └── pagination.util.ts           # 커서/오프셋 페이지네이션 헬퍼
│   │
│   ├── modules/                         # 도메인 모듈 (기능 단위)
│   │   │
│   │   ├── auth/                        # 인증/인가
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts       # POST /auth/signup, /auth/login, /auth/refresh, /auth/logout
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts      # passport-jwt
│   │   │   │   ├── google.strategy.ts   # passport-google-oauth20
│   │   │   │   └── apple.strategy.ts    # passport-apple (또는 직접 구현)
│   │   │   └── dto/
│   │   │       ├── signup.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── users/                       # 사용자 프로필/설정
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts      # GET/PATCH /users/me, DELETE /users/me
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts       # TypeORM Entity (users 테이블)
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── onboarding/                  # 온보딩 (exam_type, d_day, daily_hours 저장)
│   │   │   ├── onboarding.module.ts
│   │   │   ├── onboarding.controller.ts # POST /onboarding
│   │   │   ├── onboarding.service.ts
│   │   │   └── dto/
│   │   │       └── onboarding.dto.ts
│   │   │
│   │   ├── playlists/                   # 플레이리스트 CRUD + 검색
│   │   │   ├── playlists.module.ts
│   │   │   ├── playlists.controller.ts  # GET /playlists, GET /playlists/:id, POST /playlists, PATCH/DELETE
│   │   │   ├── playlists.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── playlist.entity.ts
│   │   │   │   ├── playlist-exam-type.entity.ts
│   │   │   │   └── session.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-playlist.dto.ts
│   │   │       └── update-playlist.dto.ts
│   │   │
│   │   ├── library/                     # 사용자 라이브러리 (좋아요, 최근 재생)
│   │   │   ├── library.module.ts
│   │   │   ├── library.controller.ts    # GET /library, POST /library/like/:id, DELETE /library/like/:id
│   │   │   ├── library.service.ts
│   │   │   └── entities/
│   │   │       └── user-playlist.entity.ts
│   │   │
│   │   ├── play/                        # 세션 실행 기록 (Now Playing 핵심)
│   │   │   ├── play.module.ts
│   │   │   ├── play.controller.ts       # POST /play/start, PATCH /play/:id/end, POST /play/:id/distraction
│   │   │   ├── play.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── play-log.entity.ts
│   │   │   │   └── distraction-log.entity.ts
│   │   │   └── dto/
│   │   │       ├── start-play.dto.ts
│   │   │       ├── end-play.dto.ts
│   │   │       └── distraction.dto.ts
│   │   │
│   │   ├── stats/                       # 학습 통계 & Fact-Check 리포트
│   │   │   ├── stats.module.ts
│   │   │   ├── stats.controller.ts      # GET /stats/daily, GET /stats/weekly, GET /stats/fact-check
│   │   │   ├── stats.service.ts
│   │   │   └── entities/
│   │   │       └── daily-stat.entity.ts
│   │   │
│   │   ├── review/                      # 에빙하우스 복습 스케줄링
│   │   │   ├── review.module.ts
│   │   │   ├── review.controller.ts     # POST /review/schedule, GET /review/upcoming
│   │   │   │                            # GET /review/upcoming 응답에 scheduled_date 포함 → 클라이언트 로컬 알림 예약용 (NOTI-002-D 하이브리드, DR-011)
│   │   │   ├── review.service.ts
│   │   │   └── entities/
│   │   │       └── review-schedule.entity.ts
│   │   │
│   │   ├── notifications/               # 알림 설정 & 알림 로그
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts  # GET /notifications, PATCH /notifications/settings
│   │   │   ├── notifications.service.ts
│   │   │   ├── fcm.service.ts           # FCM 발송 전용 서비스 (firebase-admin 래핑)
│   │   │   └── entities/
│   │   │       ├── notification.entity.ts
│   │   │       ├── notification-setting.entity.ts
│   │   │       └── device-token.entity.ts   # ERD 추가 예정
│   │   │
│   │   ├── search/                      # 검색 & 검색 히스토리
│   │   │   ├── search.module.ts
│   │   │   ├── search.controller.ts     # GET /search?q=, DELETE /search/history
│   │   │   ├── search.service.ts
│   │   │   └── entities/
│   │   │       └── search-history.entity.ts
│   │   │
│   │   └── upload/                      # 파일 업로드 (S3 Pre-signed URL)
│   │       ├── upload.module.ts
│   │       ├── upload.controller.ts     # POST /upload/presigned-url
│   │       └── upload.service.ts
│   │
│   ├── jobs/                            # 배치 잡 (스케줄러)
│   │   ├── jobs.module.ts
│   │   ├── review-skip.job.ts              # 매일 00:10 — 복습 만료 처리
│   │   ├── user-hard-delete.job.ts         # 매일 02:00 — 탈퇴 유예 7일 초과 물리 삭제
│   │   ├── learning-reminder.job.ts        # 매분 실행 — 학습 리마인더 FCM (NOTI-002-B, DR-010/011)
│   │   ├── inactive-reminder.job.ts        # 매일 10:00 — 장기 미접속 FCM (NOTI-002-C)
│   │   ├── review-fcm-fallback.job.ts      # 매일 09:00 — 복습 알림 FCM fallback (iOS 64개 한도 초과, NOTI-002-D, DR-011)
│   │   └── daily-stats-upsert.job.ts       # 매일 00:05 — daily_stats 집계 보정
│   │   # [DR-011 제거] morning-call.job.ts   → NOTI-002-A 클라이언트 로컬 알림으로 전환
│   │   # [DR-011 제거] weekly-report.job.ts  → NOTI-002-E 클라이언트 로컬 알림으로 전환
│   │   # [DR-011 제거] review-notification.job.ts → review-fcm-fallback.job.ts로 대체 (하이브리드 방식)
│   │
│   └── admin/                           # 관리자 API (별도 권한)
│       ├── admin.module.ts
│       ├── admin-playlists.controller.ts  # 공식 플레이리스트 관리
│       ├── admin-users.controller.ts      # 사용자 조회/관리
│       └── admin-stats.controller.ts      # 서비스 통계 대시보드
│
├── migrations/                          # TypeORM 마이그레이션 파일
│   └── (자동 생성: 1711000000000-InitSchema.ts)
│
├── test/                                # E2E 테스트
│   └── app.e2e-spec.ts
│
├── .env                                 # 로컬 환경 변수 (gitignore)
├── .env.example                         # 환경 변수 템플릿 (커밋)
├── docker-compose.yml                   # 로컬 개발용 (API + PostgreSQL + Redis 예비)
├── Dockerfile                           # 프로덕션 빌드
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## 3. API 응답 표준 포맷

모든 API 응답은 아래 형식을 따른다. `response.interceptor.ts`에서 자동 래핑.

```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

에러 응답:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

---

## 4. 환경 변수 목록 (.env.example)

```bash
# App
NODE_ENV=development
PORT=3000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=pace
DB_PASSWORD=
DB_DATABASE=pace_db
# 반드시 KST 설정 (RDS 파라미터 그룹 timezone=Asia/Seoul 권장)
# TypeORM connectTimeoutMS 또는 extra: { options: '-c timezone=Asia/Seoul' }
DB_TIMEZONE=Asia/Seoul

# JWT
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=14d

# Social Login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

KAKAO_REST_API_KEY=
KAKAO_CALLBACK_URL=

# FCM
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=pace-assets
CLOUDFRONT_DOMAIN=

# Admin
ADMIN_JWT_SECRET=
```

---

## 5. 주요 설계 결정 요약

| 항목 | 결정 | 이유 |
|---|---|---|
| 모노레포 vs 멀티레포 | **단일 레포 (모노레포 아님)** | API 서버 1개로 모바일/웹/관리자 모두 서빙. 클라이언트 분리는 URL 프리픽스(`/admin/`) + 가드로 처리. |
| 실시간 통신 (WebSocket) | **MVP 미포함** | 타이머는 클라이언트 로컬에서 동작. 서버 동기화는 세션 시작/종료 REST API로 충분. |
| 캐싱 (Redis) | **MVP 미포함, 추후 도입** | 현 규모에서 PostgreSQL 인덱스로 충분. 사용자 수 증가 시 학습 리마인더 FCM 발송 큐(LearningReminderJob BullMQ 전환), 검색 캐싱에 Redis 도입. |
| daily_stats UPSERT 시점 | **세션 종료 시 즉시 UPSERT + 야간 배치 보정** | 즉시 UPSERT: 사용자가 당일 통계를 바로 볼 수 있어야 함(Fact-Check). 야간 배치: 자정 넘김, 크래시 등 예외 케이스 보정. |
| 오프라인 데이터 동기화 | **클라이언트 주도** | 서버는 수신 API만 제공. 로컬 저장 → 온라인 복귀 시 클라이언트가 일괄 전송하는 방식(NP-010 네트워크 끊김 정책). |

---

## 6. 다음 단계 (이인수 구현 순서 제안)

1. **프로젝트 초기화** — NestJS + TypeORM + PostgreSQL 연결, 환경 변수 설정
2. **마이그레이션** — ERD 기준 테이블 생성 (`device_tokens` 포함)
3. **Auth 모듈** — 이메일 회원가입/로그인, JWT, 소셜 로그인 순
4. **Playlists 모듈** — 공식 플레이리스트 CRUD (시드 데이터 포함)
5. **Play 모듈** — 세션 시작/종료/이탈 기록 (핵심 데이터 수집)
6. **Stats 모듈** — daily_stats UPSERT 로직
7. **Review 모듈** — 복습 스케줄 생성/조회
8. **Notifications 모듈** — FCM 서비스 + 알림 설정
9. **Jobs 모듈** — 배치 잡 순차 구현
10. **Admin 모듈** — 관리자 전용 API

---

## 7. 알림 관련 확정 API 엔드포인트 (잭 협의, 2026-03-18)

> 모든 엔드포인트는 `Authorization: Bearer {token}` 헤더 인증 필수.
> 응답 포맷은 3절 표준 포맷 준수.

---

### 7-1. 로컬 알림 발동 기록 동기화

**`POST /api/v1/notifications/sync`**

클라이언트가 앱 foreground 진입 시점에 로컬에서 발동된 알림 기록을 서버에 일괄 전송한다. 대상 알림 유형: 모닝콜(NOTI-002-A), 주간 리포트(NOTI-002-E). 서버 측 발송 기록이 없는 로컬 알림의 발동 이력을 서버가 보완 수집하기 위한 엔드포인트다.

**요청 바디:**

```json
{
  "records": [
    { "type": "morning_call", "firedAt": "2026-03-18T08:00:00+09:00" },
    { "type": "weekly_report", "firedAt": "2026-03-16T20:00:00+09:00" }
  ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `records` | Array | YES | 발동 기록 배열. 빈 배열 허용 (no-op) |
| `records[].type` | String (ENUM) | YES | `morning_call`, `weekly_report` |
| `records[].firedAt` | ISO 8601 String | YES | 로컬 알림 발동 시각. 타임존 오프셋 포함 필수 (`+09:00`) |

**성공 응답 (HTTP 200):**

```json
{
  "success": true,
  "data": { "synced": 2 },
  "message": "OK"
}
```

**멱등 처리 설계:**

`(user_id, type, firedAt)` 조합 기준 중복 insert를 방지한다. `notification_log_sync_records` 테이블에 UPSERT로 저장하며, 동일 조합이 이미 존재하면 무시(no-op)하고 200 반환한다.

`notifications` 테이블(서버 발송 로그)과 구분하여 별도 테이블로 관리한다. 서버 발송 vs 로컬 발동 기록을 혼재시키면 FCM 크론 중복 발송 방지 로직이 오염된다.

**ERD 신규 테이블: `notification_log_sync_records`**

| 컬럼 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PK |
| user_id | BIGINT UNSIGNED | NO | - | FK → users.id. ON DELETE CASCADE |
| type | ENUM | NO | - | `morning_call`, `weekly_report` |
| fired_at | DATETIME | NO | - | 로컬 알림 발동 시각 (KST 변환 저장) |
| created_at | DATETIME | NO | NOW() | 서버 수신 시각 (KST) |

인덱스: UK `(user_id, type, fired_at)` — 중복 방지 기준 키

> **이인수 구현 주의:** `firedAt`은 클라이언트가 ISO 8601 형식으로 전송하므로, 서비스 레이어에서 KST DATETIME으로 파싱 후 저장한다. `dayjs(firedAt).tz('Asia/Seoul').toDate()` 패턴 사용.

---

### 7-2. 복습 알림 FCM fallback 등록/해제

**`POST /api/v1/notifications/fcm-fallback-request`**

iOS 로컬 알림 슬롯(최대 64개) 부족 시, 클라이언트가 서버에 복습 알림 FCM 발송 전환을 요청한다. 동일 엔드포인트에서 등록과 해제를 모두 처리한다.

**경고선:** 로컬 알림 예약 수 50개 초과 시 호출 (64개 한도까지 14개 여유). Android는 한도 제한 없으므로 해당 없음.

**요청 헤더:**

| 헤더 | 필수 | 설명 |
|---|---|---|
| `Authorization` | YES | `Bearer {JWT}` — 사용자 인증 |
| `X-Device-Token` | YES | 대상 FCM 토큰. `device_tokens` 테이블 조회 기준 키. |

**요청 바디:**

```json
{
  "active": true
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `active` | Boolean | YES | `true`: fallback 활성화(FCM 전환 요청). `false`: fallback 해제(로컬 알림 복귀). |

**성공 응답 (HTTP 200):**

```json
{
  "success": true,
  "data": { "fcmFallbackActive": true },
  "message": "OK"
}
```

**에러 응답:**

| 케이스 | HTTP 코드 | 설명 |
|---|---|---|
| `X-Device-Token` 헤더 미전달 | **400 Bad Request** | 필수 헤더 누락. 요청 자체가 잘못된 클라이언트 오류. |
| 토큰 매칭 실패 (`device_tokens`에 해당 토큰 없음) | **404 Not Found** | 해당 FCM 토큰이 DB에 존재하지 않음. |

**서버 처리 로직:**

1. `X-Device-Token` 헤더 존재 여부 검증 → 없으면 400 반환
2. `device_tokens WHERE user_id = :userId AND token = :fcmToken` 조회
3. 행 미존재 시 404 반환
4. `is_fcm_fallback_active = :active` 업데이트 후 200 응답

`ReviewFcmFallbackJob`은 `device_tokens.is_fcm_fallback_active = true`인 기기를 대상으로 FCM 발송한다.

**FCM 토큰 갱신 연동:**

클라이언트에서 `onTokenRefresh` 이벤트로 FCM 토큰이 갱신될 경우, 기존 토큰은 무효화되고 신규 토큰이 `device_tokens`에 등록된다. 이때 `is_fcm_fallback_active` 상태는 초기값(`false`)으로 리셋되므로, 클라이언트는 토큰 갱신 후 fallback 활성화 상태를 재확인하여 필요 시 재호출해야 한다.

**ERD 변경: `device_tokens` 컬럼 추가**

| 컬럼 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| is_fcm_fallback_active | TINYINT(1) | NO | 0 | iOS 로컬 알림 슬롯 부족 시 FCM fallback 활성화 여부 |

> **이인수 구현 주의:** `active: false` 수신 시 `is_fcm_fallback_active = false` 업데이트로 처리. 클라이언트가 로컬 슬롯 확보 후(복습 알림 일부 삭제 등) 자동으로 해제 요청을 보내는 방식이므로, 서버는 값만 갱신하면 된다. `X-Device-Token` 헤더 검증은 NestJS 커스텀 파이프 또는 가드로 처리 권장 — 컨트롤러 레이어에서 분리.

---

### 7-3. 알림 설정 조회 — `weekly_report_time` / `weekly_report_day` 포함

**`GET /api/v1/notification-settings`**

기존 알림 설정 조회 응답에 주간 리포트 발송 시각/요일 필드를 추가한다.

**응답 예시 (변경 부분 발췌):**

```json
{
  "success": true,
  "data": {
    "masterEnabled": true,
    "morningCallEnabled": true,
    "morningCallTime": "08:00",
    "learningReminderEnabled": true,
    "inactiveReminderEnabled": true,
    "weeklyReportEnabled": true,
    "weeklyReportDay": 0,
    "weeklyReportTime": "20:00"
  },
  "message": "OK"
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `weeklyReportDay` | Integer (0~6) | 발송 요일. 0=일요일, 1=월요일 … 6=토요일. MVP 고정값: `0` |
| `weeklyReportTime` | String (HH:mm) | 발송 시각. MVP 고정값: `"20:00"` |

**ERD 변경: `notification_settings` 컬럼 추가**

| 컬럼 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| weekly_report_day | TINYINT UNSIGNED | NO | 0 | 주간 리포트 발송 요일. 0=일요일 … 6=토요일. MVP 기본값 0 |
| weekly_report_time | TIME | NO | 20:00:00 | 주간 리포트 발송 시각. MVP 기본값 20:00 |

**컬럼 추가 근거:** MVP에서 `일요일 20:00` 고정이더라도 코드 상수로 처리하면 이후 "사용자 직접 설정" 기능 추가 시 스키마 변경 + 클라이언트 코드 변경이 동시에 발생한다. 컬럼을 선제적으로 추가해 두면 향후 변경 비용이 0이다. `weekly_report_time`만 추가하면 절반짜리 확장성이므로 `weekly_report_day`도 함께 추가한다.

> **이인수 구현 주의:** 클라이언트 로컬 알림 예약 기준 데이터 제공이 목적이므로, 서버 자체 크론 잡과는 무관하다 (주간 리포트는 DR-011에서 로컬 알림으로 전환 완료). 현재 `weekly_report_day`, `weekly_report_time`은 읽기 전용. PATCH 엔드포인트에는 아직 포함하지 않는다 (기능 확장 시 추가).

---

## 8. 미결 사항 (PO/팀 협의 필요)

**현재 미결:**

| 항목 | 내용 | 우선순위 |
|---|---|---|
| 이미지 리사이징 방식 | Sharp(서버 인라인) vs Lambda(분리) — MVP 기준 Sharp 추천이나 확정 필요 | 낮음 |

**DR-010에서 해소된 항목:**

| 항목 | 결정 |
|---|---|
| `device_tokens` ERD 추가 | 완료 — ERD 테이블 15번 `device_tokens` 추가 |
| Refresh Token 저장 방식 | 완료 — 별도 `refresh_tokens` 테이블로 확정 |
| 복수 기기 로그인 | 완료 — MVP에서 복수 기기 허용. `refresh_tokens` 1 유저 N행 구조로 지원 |
| MorningCall 알림 오차 허용 범위 | 완료 — 30분 오차 불가 결정. 매분 실행(`* * * * *`)으로 확정 |
| Access Token 전달 방식 | 완료 — `Authorization: Bearer {token}` 헤더 방식으로 확정 |

**DR-011에서 해소된 항목:**

| 항목 | 결정 |
|---|---|
| 모닝콜(NOTI-002-A) 처리 방식 | 완료 — 클라이언트 로컬 알림으로 전환. `MorningCallJob` 서버 크론 제거. 클라이언트 앱 실행 시 `notification_settings` 동기화 후 로컬 예약 갱신. |
| 주간 리포트(NOTI-002-E) 처리 방식 | 완료 — 클라이언트 로컬 알림으로 전환. `WeeklyReportJob` 서버 크론 제거. |
| 복습 알림(NOTI-002-D) 처리 방식 | 완료 — 하이브리드 방식으로 확정. `GET /review/upcoming` 응답에 `scheduled_date` 포함 → 클라이언트 로컬 예약. iOS 64개 한도 초과 케이스만 `ReviewFcmFallbackJob`으로 서버 FCM 발송. |
| FCM 크론 쿼리 윈도우 설계 | 완료 — `BETWEEN :lastRun AND :now` 슬라이딩 윈도우 방식 불채택. 멱등성 보장을 위해 "오늘 날짜 + 조건 충족 + `notifications` 테이블 당일 미발송" 조합으로 설계. 1-4절 쿼리 윈도우 설계 참고. |
| `notifications` 테이블 인덱스 | 완료 — `(user_id, type, DATE(created_at))` 복합 인덱스 추가 필요. ERD 반영 요청. |

**잭 협의 해소 항목 (2026-03-18 확정):**

| 항목 | 결정 |
|---|---|
| 모닝콜/주간리포트 로컬 알림 동기화 | `POST /api/v1/notifications/sync` 신규 엔드포인트로 처리. 앱 foreground 진입 시 클라이언트가 로컬 알림 발동 기록 일괄 전송. 7절 참고. |
| 복습 알림 iOS 64개 한도 초과 감지 및 fallback | 클라이언트 로컬 알림 예약 수 50개 초과 시 `POST /api/v1/notifications/fcm-fallback-request` 호출. fallback 해제는 동일 엔드포인트에 `active: false` 전송. 7절 참고. |
| 주간 리포트 발송 시각 데이터 제공 | `GET /api/v1/notification-settings` 응답에 `weekly_report_time`, `weekly_report_day` 포함. ERD `notification_settings` 테이블에 컬럼 추가 완료. 7절 참고. |
