# PostgreSQL 전환 확정 및 인프라 비용 산출

> 일시: 2026-03-18
> 참석: PO(사용자), 위더(AI 시니어 기획자), 이명환(백엔드 아키텍트), 이인수(백엔드 개발자)

---

## 논의 배경

기술 스택(`planning/tech-spec/backend.md`) 검토 중 PO가 DB 엔진을 PostgreSQL로 전환하는 것이 어떻겠냐고 제안. 이명환에게 기술적 타당성 검토를 의뢰하여 결과를 바탕으로 확정.

---

## 결정 사항

### 1. DB 엔진 전환 — MySQL 8.0 → PostgreSQL 16 (DR-012)

이명환 검토 결과 PostgreSQL 전환 권고. PO 확정.

**전환 권고 근거:**
- Fact-Check 리포트, AI 피드백 루프 등 집계 쿼리 복잡도가 높아질수록 PostgreSQL 유리
- 부분 인덱스(Partial Index) 네이티브 지원
- 이인수 구현 착수 전 시점이라 전환 비용 최소

**처리 완료:**
- `V1__init_schema.sql` PostgreSQL 16 문법 전면 재작성
- `V2__alter_notifications.sql` 재작성
- `backend.md` DB 스택 수정 (MySQL 8.0 → PostgreSQL 16, 포트 3306 → 5432)
- `PACE_ERD.md` 타입 표기 업데이트

---

### 2. MVP 인프라 비용 산출

PO가 예상 운영 비용을 문의. 이명환이 AWS 서울 리전 기준으로 산출.

**MVP 단계 (~1,000명): 월 약 $49 / 약 67,700원**

| 항목 | 월 비용 |
|---|---|
| EC2 t3.small (API 서버) | $15.18 |
| RDS PostgreSQL 16 db.t3.micro | $15.33 |
| S3 + CloudFront | $1.62 |
| FCM / Firebase | $0 (무료 티어) |
| Apple Developer (월 환산) | $8.25 |
| 도메인/Route 53/기타 | $8.67 |
| **합계** | **~$49/월** |

**성장 단계 (~10,000명):** 약 $120~150/월 예상

> **이명환 코멘트:** EC2 t2.micro(무료 티어)는 NestJS + 크론 잡 운영 시 OOM 위험. 초기 테스트는 무료 티어, 정식 오픈 전 t3.small 전환 권고.

상세 내역: `planning/tech-spec/infrastructure-cost.md`

---

## 완료된 작업 목록

| 작업 | 담당 | 파일 |
|---|---|---|
| PostgreSQL 전환 타당성 검토 | 이명환 | — |
| V1 마이그레이션 PostgreSQL 재작성 | 이명환 | `planning/erd/migrations/V1__init_schema.sql` |
| V2 마이그레이션 PostgreSQL 재작성 | 이명환 | `planning/erd/migrations/V2__alter_notifications.sql` |
| backend.md DB 스택 수정 | 이명환 | `planning/tech-spec/backend.md` |
| ERD 타입 표기 업데이트 | 이명환 | `planning/erd/PACE_ERD.md` |
| 인프라 비용 산출 문서 | 이명환 | `planning/tech-spec/infrastructure-cost.md` |
| DR-012 기록 | 위더 | `decision-making/DR-012_PostgreSQL_Migration.md` |

---

## 디자인 이슈 수정 (별도 진행)

| Node ID | 화면 | 이슈 | 상태 |
|---|---|---|---|
| `NBjym` | 탈퇴 유예 — 로그인 경고 | 루트 프레임 gap/padding 없음 | 완료 |
| `i7q4Z` | MP-005 Settings | 설정 Row 텍스트 가운데 정렬 | 완료 |
| `4DHrg` | Search — 탐색 메인 | Bottom Nav 비어있음 | 완료 |
| `8J2El` | Search — 검색 모드 | 최근 검색어 Row 텍스트 가운데 정렬 | 완료 |

---

## 미결 사항

- [ ] **플레이리스트 삭제 정책** — PO 결정 필요 (소프트 삭제 / CASCADE / 관리자만 삭제)
- [ ] **개발 환경 세팅 착수** — PostgreSQL 전환 완료 후 이인수 프로젝트 초기화 진행 가능

---

## Action Items

- [x] **이명환**: PostgreSQL 전환 작업 완료
- [x] **이명환**: 인프라 비용 산출 (`infrastructure-cost.md`)
- [x] **위더**: DR-012 기록
- [ ] **PO**: 플레이리스트 삭제 정책 결정
