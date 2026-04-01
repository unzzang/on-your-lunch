# DR-012. DB 엔진 전환 — MySQL 8.0 → PostgreSQL 16

> 결정일: 2026-03-18
> 결정자: PO
> 관련 문서: planning/tech-spec/backend.md, planning/erd/PACE_ERD.md, planning/erd/migrations/

---

## 배경

기술 스택 검토 중 PO가 PostgreSQL 전환 가능성을 제기. 이명환(백엔드 아키텍트)이 기술적 타당성을 검토하여 전환을 권고하였고, PO가 최종 확정함.

---

## 결정

**MySQL 8.0 → PostgreSQL 16으로 전환**

---

## 전환 근거

| 항목 | 내용 |
|---|---|
| 집계 쿼리 성능 | Window Function, CTE 처리가 MySQL보다 우수. Fact-Check 리포트 및 AI 피드백 루프의 쿼리 복잡도 증가 시 장기적으로 유리 |
| 부분 인덱스 | `WHERE is_deleted = false` 조건부 인덱스 네이티브 지원 (MySQL에 없음). `users` 테이블 소프트 딜리트 패턴에 직접 적용 가능 |
| 쿼리 플래너 예측 가능성 | PostgreSQL 실행 계획이 MySQL 대비 예측 가능성 높음. 장기 운영 유지보수 비용 절감 |
| 전환 타이밍 최적 | 이인수 구현 착수 전. 문서·SQL 스크립트 수준에서 변경 완료 가능. 이후 전환 시 코드 전면 재작성 필요 |

---

## 영향 범위 및 처리

| 영역 | 변경 내용 | 상태 |
|---|---|---|
| `V1__init_schema.sql` | PostgreSQL 16 문법 전면 재작성 | 완료 |
| `V2__alter_notifications.sql` | PostgreSQL 16 문법 재작성 | 완료 |
| `planning/tech-spec/backend.md` | `MySQL 8.0` → `PostgreSQL 16`, 포트 3306 → 5432 | 완료 |
| `planning/erd/PACE_ERD.md` | 타입 표기 PostgreSQL 기준으로 수정 | 완료 |
| TypeORM DataSource 설정 | `type: 'postgres'` — 이인수가 프로젝트 초기화 시 적용 | 구현 시 처리 |

### 주요 문법 변환 내역

| MySQL | PostgreSQL |
|---|---|
| `TINYINT(1)` | `BOOLEAN` |
| `BIGINT UNSIGNED AUTO_INCREMENT` | `BIGINT GENERATED ALWAYS AS IDENTITY` |
| `DATETIME` | `TIMESTAMP` |
| `ENGINE=InnoDB`, `CHARSET=utf8mb4` | 제거 |
| `INSERT IGNORE` | `INSERT ... ON CONFLICT DO NOTHING` |
| `ON DUPLICATE KEY UPDATE` | `ON CONFLICT (...) DO UPDATE SET` |
| `SET FOREIGN_KEY_CHECKS` | 제거 (트랜잭션으로 처리) |
| `INTERVAL 2 HOUR` | `INTERVAL '2 hours'` |

---

## 인프라 비용 (참고)

AWS 서울 리전(ap-northeast-2) 기준, `planning/tech-spec/infrastructure-cost.md` 참조.

- **MVP (~1,000명):** 약 $49/월 (~67,700원) — RDS PostgreSQL 16 요금 MySQL과 동일
- **성장 단계 (~10,000명):** 약 $120~150/월 예상
