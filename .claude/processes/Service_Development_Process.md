# 서비스 개발 프로세스 (마스터)

> 적용 범위: 신규 서비스의 아이디어 → 출시까지 전체 흐름
> 책임자: PO (의사결정), 위더 (조율, 필요 시 호출)
> 선행 조건: 없음 (최상위 프로세스)

---

## 1. 역할

서비스 개발의 전체 Stage를 정의하고, 각 Stage의 진입 조건과 완료 기준을 관리한다.

## 2. 프로세스

```
Stage 0. 프로젝트 셋업       → Project_Setup_Process.md
Stage 1. 사전조사             → Research_Process.md
Stage 2. 기획                 → Planning_Process.md
Stage 3. 디자인               → Design_Process.md
Stage 4. 개발                 → Development_Process.md
Stage 5. QA                   → QA_Process.md
Stage 6. 출시                 → Launch_Process.md
```

### 핵심 원칙

| 원칙 | 설명 |
|------|------|
| Stage Gate | 각 Stage의 완료 기준을 충족해야 다음 Stage 진입 |
| 3라운드 정제 | 초안 → 검증(송현아) → 확정. 주요 산출물에 적용 |
| PO 직접 지시 | PO가 에이전트에게 직접 지시. 위더는 호출 시에만 참여 |
| 의사결정 기록 | 모든 주요 결정은 `.docs/001_decision-making/`에 DR로 기록 |

### 팀 구조 (8개 팀, 22명)

팀 구성과 에이전트 상세는 `agents/` 참조.

### 콘텐츠/마케팅 (Stage와 독립)

- 콘텐츠 제작 → Content_Process.md
- 마케팅 전략/운영 → Marketing_Process.md

## 3. 완료 기준

- [ ] Stage 6 완료 (앱스토어/웹 배포 완료)
- [ ] 출시 후 안정화 기간 통과
