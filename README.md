# On-Your-Mark — AI 에이전트 회사 프레임워크

AI 에이전트 팀을 **회사처럼 조직하고 운영**하여 서비스를 기획·개발·출시하는 프레임워크.

---

## 이것은 무엇인가?

사람 1명(PO) + AI 에이전트 14명이 하나의 회사처럼 일합니다.

```
PO (사람) — 의사결정자
  └─ AI 파트너 — 기획 총괄 + 에이전트 중재자
       ├─ 리서치팀 (6명)  — 시장/경쟁/고객/실현가능성 조사
       ├─ 개발팀 (4명)    — 백엔드 + 프론트엔드 구현
       ├─ 디자인팀 (1명)  — UI/UX 디자인
       ├─ 데이터팀 (1명)  — KPI, 분석, 대시보드
       └─ QA/검증팀 (2명) — 품질 검증 + 서비스 테스트
```

## 핵심 개념

### Agent Companies 프로토콜 호환

마크다운 기반으로 회사 구조를 정의한다. Git으로 버전 관리 가능.

| 파일 | 역할 |
|------|------|
| `COMPANY.md` | 회사 미션, 원칙, 조직 구조 |
| `teams/*/TEAM.md` | 팀별 역할, 작업 흐름, 멤버 |
| `agents/*/AGENTS.md` | 에이전트별 전문성, 책임 범위 |
| `skills/*/SKILL.md` | 실행 가능한 스킬 (명령어) |
| `processes/*.md` | 7 Stage 업무 프로세스 |
| `rules/*.md` | 운영 규칙 (위임 원칙, Gate 진입 등) |

### Paperclip 운영 개념 적용

| Paperclip 개념 | On-Your-Mark 구현 |
|---------------|----------------|
| 조직도 | `COMPANY.md` + `teams/` |
| 에이전트 오케스트레이션 | AI 파트너가 허브-스포크로 중재 |
| 거버넌스 | `rules/` (위임 원칙, Gate 진입 체크) |
| 목표 정렬 | 7 Stage 프로세스 (미션 → Stage → Gate → 태스크) |
| 예산 관리 | (향후 구현) |
| 감사 로그 | 회의록(`/minutes`) + 의사결정(`/decision`) |

### 실전 검증된 프로세스

PACE 프로젝트에서 실전 검증한 프로세스를 기반으로 구축.

| Stage | 이름 | 핵심 |
|-------|------|------|
| 0 | 프로젝트 셋업 | clone → `/init` 대화형 셋업 |
| 1 | 사전조사 | 5단계 리서치 (조사설계→4명 병렬→검증→전략 종합) |
| 2 | 기획 | 3 Gate (서비스정의→기능설계→기술설계) |
| 3 | 디자인 | 4 Phase (시스템→화면→리뷰→핸드오프) |
| 4 | 개발 | 5 Phase (아키텍처→환경→API계약→기능개발→QA투입) |
| 5 | QA | 4 Phase (정적→통합→기능→재검증) |
| 6 | 출시 | 3 Phase (준비→런칭→안정화) |

---

## 빠른 시작

```bash
# 1. Clone
git clone https://github.com/unzzang/claude-framework.git my-project
cd my-project
rm -rf .git && git init

# 2. Claude Code에서 /init 실행
/init
```

---

## 폴더 구조

```
On-Your-Mark_Company/
├── COMPANY.md              ← 회사 정의
├── CLAUDE.md               ← AI 파트너 역할
├── README.md               ← 이 파일
├── settings.json           ← 실행 설정
├── .claude/                ← 회사 인프라
│   ├── agents/               22명 + AI 파트너
│   ├── teams/                8개 팀
│   ├── skills/               스킬 (INDEX.md)
│   ├── processes/            업무 프로세스
│   ├── rules/                운영 규칙 (INDEX.md)
│   ├── references/           참조 자료
│   └── hooks/                자동화 안전장치
├── .documents/             ← 회사 문서 (전사 회의록, 회사 DR)
├── .efforts/               ← 프로젝트 현황판 (상태 카드)
├── .kits/                  ← 템플릿 (프로젝트 + 문서)
│   ├── templates/product/    서비스 프로덕트 템플릿
│   ├── templates/documents/  문서 템플릿
│   └── attachments/          참고 파일
└── .infra/                 ← 회사 운영용 코드
    ├── tools/
    ├── website/
    └── shared/
```

---

## 운영 원칙

### 1. 전문가 중심

각 영역의 전문 에이전트가 해당 업무를 수행한다. AI 파트너는 **중재자**이지 **실행자**가 아니다.

### 2. 프로세스 기반

7 Stage 표준 프로세스를 따른다. Gate 진입 시 프로세스 문서를 먼저 확인하고, 활동을 3분류(직접/PO협의/위임)한 후 진행한다.

### 3. 사실 기반

가짜 데이터 금지. 모호 표현 금지. 모든 수치에 출처 명시.

### 4. PO 중심 의사결정

AI는 분석하고 제안하지만, **최종 판단은 항상 사람(PO)**이 한다.
