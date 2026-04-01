# PACE 인프라 월 운영 비용 산출

> 작성자: 이명환 (백엔드 아키텍트)
> 작성일: 2026-03-18
> 기준: AWS ap-northeast-2 (서울 리전), MVP 단계 (~1,000명), 2026년 3월 AWS 공시 요금 기준
> 연관 문서: `planning/tech-spec/backend.md`

---

## 사전 고지 — DB 스택 불일치 확인 필요

PO께서 **PostgreSQL 16** 전제를 제시하셨으나, 현재 `backend.md` 및 `planning/erd/PACE_ERD.md`는 **MySQL 8.0** 기준으로 설계되어 있습니다.

| 문서 | DB 스택 |
|---|---|
| `planning/tech-spec/backend.md` | MySQL 8.0 (RDS, db.t3.micro) |
| `planning/erd/PACE_ERD.md` | MySQL 8.0 기준 타입/문법 사용 |
| PO 이번 요청 전제 | PostgreSQL 16 |

**비용 차이는 미미합니다** (동급 인스턴스 기준 RDS MySQL vs PostgreSQL 요금 동일). 그러나 ERD의 MySQL 전용 문법(ENUM, UNSIGNED, DATETIME, TINYINT 등)을 PostgreSQL로 재검토해야 할 항목이 있습니다. DB 확정을 별도 의사결정 기록(DR)으로 처리할 것을 권고합니다.

본 문서의 비용 산출은 **MySQL 8.0 기준** (현재 설계 기준)으로 작성합니다. PostgreSQL 16으로 변경해도 요금은 동일합니다.

---

## 1. MVP 단계 월 운영 비용 (~1,000명 기준)

### 1-1. 항목별 상세 비용

| # | 항목 | 사양 | 월 비용 (USD) | 월 비용 (KRW 환산, 약 1,380원/달러) | 비고 |
|---|---|---|---|---|---|
| 1 | **API 서버 (EC2)** | t3.small (2vCPU / 2GB RAM), On-Demand | $15.18 | 약 21,000원 | NestJS 서버 단일 인스턴스. Docker Compose 운영. |
| 2 | **DB (RDS MySQL 8.0)** | db.t3.micro (2vCPU / 1GB RAM), Single-AZ, gp2 20GB | $15.33 | 약 21,000원 | Multi-AZ 미적용. 스토리지 20GB → $2.30/월 포함. |
| 3 | **스토리지 (S3)** | 표준 스토리지 10GB + PUT/GET 요청 50만 건 | $0.53 | 약 730원 | 커버 이미지, 썸네일. 사용자 1,000명 기준 극소량. |
| 4 | **CDN (CloudFront)** | 데이터 전송 10GB/월, HTTP 요청 100만 건 | $1.09 | 약 1,500원 | S3 이미지 CDN 서빙. 한국 내 트래픽 기준. |
| 5 | **FCM (Firebase)** | 무료 | $0 | $0 | FCM 자체는 완전 무료. 건수 제한 없음. |
| 6 | **푸시 알림 인프라** | Firebase 프로젝트 세팅 | $0 | $0 | Firebase 프로젝트 생성/설정 비용 없음. Spark(무료) 플랜으로 충분. |
| 7 | **앱 배포 — Apple Developer** | Apple Developer Program 연간 | $99/년 | 약 136,000원/년 → **월 11,400원** | iOS 앱 배포 필수. 연간 결제 후 월 환산. |
| 8 | **앱 배포 — Google Play** | Google Play 개발자 계정 등록비 | $25 (일회성) | 약 34,500원 (일회성) | 월 비용 없음. 최초 1회만 부과. |
| 9 | **도메인** | .com 도메인 (Route 53 또는 외부 등록) | $1.00 | 약 1,400원 | Route 53 기준 $12~15/년 → 월 $1.00 환산. |
| 10 | **SSL 인증서** | AWS ACM (CloudFront + ALB 연동) | $0 | $0 | ACM 공개 인증서 무료. Let's Encrypt도 무료. |
| 11 | **로그 (CloudWatch Logs)** | 5GB/월 수집 + 5GB/월 저장 | $3.05 | 약 4,200원 | 무료 티어: 5GB 수집 무료. 저장 $0.61/GB. MVP 수준에서 거의 무료 티어 내 처리 가능. |
| 12 | **탄력적 IP (EIP)** | EC2에 고정 IP 할당 | $3.72 | 약 5,100원 | 연결된 EC2가 실행 중이면 무료이나, EC2 중단 시 $0.005/시간 과금. 실질적으로 월 $0~3.72. |
| 13 | **데이터 전송 (EC2 아웃바운드)** | 10GB/월 (API 응답 + 기타) | $0.90 | 약 1,240원 | 첫 100GB/월은 $0.09/GB. 1,000명 수준에서 10GB 이하 예상. |

---

### 1-2. MVP 단계 월 합계

| 구분 | USD/월 | KRW/월 (약) |
|---|---|---|
| AWS 인프라 소계 (EC2 + RDS + S3 + CF + CW + EIP + 전송) | $39.80 | 약 54,900원 |
| Apple Developer (월 환산) | $8.25 | 약 11,400원 |
| 도메인 | $1.00 | 약 1,400원 |
| **총합** | **$49.05/월** | **약 67,700원/월** |

> Google Play 등록비($25)는 일회성이므로 월 합계에서 제외.

---

### 1-3. 항목별 상세 근거

#### EC2 t3.small 선택 근거

- NestJS 프로세스 상시 실행 + 매분 크론(`LearningReminderJob`) + Docker Compose 운영 기준
- t3.micro(1GB)는 Node.js 런타임 + TypeORM 커넥션 풀 + 크론 잡 동시 실행 시 OOM 가능성 존재
- t3.small(2GB)로 시작, 트래픽 증가 시 t3.medium($30.37/월)으로 업그레이드
- Reserved Instance 1년 약정 시 t3.small 기준 $10.22/월 (약 33% 절감) → 서비스 안정화 후 전환 권장

#### RDS db.t3.micro 선택 근거

- 1,000명 기준 동시 접속자 수 50명 미만 예상
- TypeORM 커넥션 풀 기본값(10개)으로 충분히 처리 가능
- Multi-AZ 미적용: MVP 단계에서 RTO(복구 목표 시간) 수 분 허용 가능하다고 판단
  - Multi-AZ 적용 시 비용 2배($30.66/월) → 정식 출시 후 적용 권장
- 스토리지 자동 증가(Auto Scaling) 활성화 권장 (초기 20GB, 최대 100GB 설정)

#### S3 + CloudFront 비용이 낮은 이유

- MVP 단계 커버 이미지: 시스템 제공 공식 플레이리스트 수십 개 + 사용자 업로드 이미지
- 사용자 1,000명, 이미지 평균 100KB 기준 총 100MB 미만
- CloudFront 무료 티어: 매월 1TB 데이터 전송 + 1,000만 HTTP 요청 → MVP 완전 무료 범위 내
  - 단, AWS 계정 생성 12개월 이후 무료 티어 만료 시 위 요금 기준 적용

#### FCM / Firebase 무료 티어

- **FCM 메시지 발송: 무료 (건수 제한 없음)**
- Firebase Spark 플랜(무료)으로 FCM 기능 전부 사용 가능
- 유료 전환이 필요한 시점: Firebase Analytics, Remote Config, A/B Testing 등 고급 기능 사용 시
- PACE MVP 범위에서는 FCM 발송 전용 사용이므로 **완전 무료**

#### Apple Developer / Google Play

| 항목 | 비용 | 주기 | 비고 |
|---|---|---|---|
| Apple Developer Program | $99 | 연간 | iOS 앱스토어 배포 필수. 개인/법인 동일 |
| Google Play Developer | $25 | 일회성 | 최초 1회만. 이후 무료. |

> Apple Developer는 카드사 USD 결제 기준 환율 적용. 환율 변동 주의.

---

## 2. 성장 단계 예상 비용 (~10,000명 기준)

### 2-1. 변경 사양

| 항목 | MVP (~1,000명) | 성장 단계 (~10,000명) | 변경 이유 |
|---|---|---|---|
| API 서버 | EC2 t3.small × 1 | EC2 t3.medium × 2 + ALB | 트래픽 증가, 고가용성 확보 |
| DB | RDS db.t3.micro Single-AZ | RDS db.t3.small Multi-AZ | 커넥션 수 증가, 가용성 요건 |
| S3 | ~10GB | ~100GB | 사용자 업로드 이미지 누적 |
| CloudFront | ~10GB/월 | ~100GB/월 | 이미지 트래픽 증가 |
| CloudWatch | 5GB/월 | 50GB/월 | 로그 규모 증가 |
| Redis (ElastiCache) | 미포함 | cache.t3.micro 추가 | LearningReminderJob BullMQ 전환 기준 |

### 2-2. 성장 단계 월 비용 (추정)

| 항목 | 월 비용 (USD) | 월 비용 (KRW 약) |
|---|---|---|
| EC2 t3.medium × 2 | $60.74 | 약 83,800원 |
| ALB (Application Load Balancer) | $18.00 | 약 24,800원 |
| RDS db.t3.small Multi-AZ | $61.32 | 약 84,600원 |
| S3 (100GB + 요청) | $2.40 | 약 3,300원 |
| CloudFront (100GB/월) | $9.00 | 약 12,400원 |
| ElastiCache cache.t3.micro | $13.86 | 약 19,100원 |
| CloudWatch Logs | $30.50 | 약 42,100원 |
| 기타 (도메인, 전송, EIP 등) | $12.00 | 약 16,600원 |
| Apple Developer | $8.25 | 약 11,400원 |
| **총합** | **약 $216/월** | **약 298,000원/월** |

> ALB 도입 시 EC2 Auto Scaling과 연동하여 피크 트래픽 대응. 평시에는 t3.medium 1대로 운영 가능.

---

## 3. 비용 최적화 권고

### MVP 단계 즉시 적용 가능

| 권고 사항 | 예상 절감 |
|---|---|
| EC2 t3.small Reserved Instance 1년 약정 전환 (서비스 안정화 후) | 월 약 $5 절감 |
| S3 Intelligent-Tiering 적용 (접근 빈도 낮은 구 이미지) | 미미 (MVP 규모) |
| CloudWatch 로그 보존 기간 설정 (30일 이상 자동 삭제) | 로그 비용 통제 |

### 성장 단계 전환 시 고려

| 권고 사항 | 내용 |
|---|---|
| RDS Proxy 도입 | 커넥션 풀 관리. Lambda/서버리스 전환 시 특히 유효 |
| S3 Transfer Acceleration | 해외 사용자 확장 시 적용 |
| Savings Plans | EC2 + Fargate 통합 약정으로 최대 66% 절감 |

---

## 4. 무료 티어 활용 정리

AWS 계정 생성 후 12개월 무료 티어 기준:

| 항목 | 무료 티어 범위 | PACE MVP 충족 여부 |
|---|---|---|
| EC2 t2.micro (1GB) | 750시간/월 | 삼각형 — t3.small 사용 시 무료 티어 대상 아님. t2.micro는 OOM 위험 |
| RDS db.t2.micro | 750시간/월 + 20GB | 삼각형 — db.t3.micro는 무료 티어 해당 없음. db.t2.micro 사용 시 무료 가능하나 성능 리스크 |
| S3 | 5GB + PUT 2만 건 + GET 20만 건 | 초기 몇 개월 충분 |
| CloudFront | 1TB/월 전송 + 1,000만 요청 | 충분 (MVP 규모 완전 커버) |
| CloudWatch Logs | 5GB 수집 무료 | 충분 |

> 계정 생성 직후 MVP 테스트 기간에는 **월 $10~15 수준**으로 운영 가능 (Apple Developer 포함 시 $20 내외).
> 12개월 무료 티어 종료 후부터 위 정식 요금 기준 적용.

---

## 5. 요약

| 단계 | 사용자 규모 | 월 예상 비용 (USD) | 월 예상 비용 (KRW) |
|---|---|---|---|
| 테스트/초기 (AWS 무료 티어 기간) | ~100명 | $20 내외 | 약 27,600원 |
| **MVP 정식 운영** | **~1,000명** | **$49/월** | **약 67,700원** |
| 성장 단계 | ~10,000명 | $216/월 | 약 298,000원 |
| 스케일업 단계 | ~100,000명 | 별도 아키텍처 검토 필요 | ECS/EKS 전환, RDS Aurora 고려 |

---

## 6. 아키텍트 코멘트

MVP 단계 **월 약 7만원 미만**이라는 수치는 합리적입니다. 단일 EC2 + 단일 RDS 구조는 고가용성(HA) 미보장이지만, MVP 단계에서 허용 가능한 트레이드오프라고 판단합니다.

가장 큰 단일 비용 항목은 RDS($21,000원)와 EC2($21,000원)로, 이 두 항목이 전체의 약 60%를 차지합니다. **서비스 안정화 이후 두 항목 모두 Reserved Instance로 전환**하면 약 30~33% 절감이 가능합니다.

**DB 스택 확정이 우선입니다.** MySQL 8.0(현재 ERD 설계 기준)과 PostgreSQL 16 중 어느 것으로 갈지 PO와 확정 후 ERD를 재검토해야 합니다. 비용은 동일하지만 ERD 타입 재검토(ENUM → CHECK constraint, UNSIGNED → 표준 INTEGER 등) 작업이 이인수 구현 착수 전에 완료되어야 합니다.
