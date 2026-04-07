# PACE AI 인프라 구축: Sub Agent 및 Skill 구현

> 일시: 2026-03-16
> 참석: PO(사용자), 위더(AI 시니어 기획자)

## 논의 배경

08번 회의에서 확정된 팀 구성(9명)을 실제로 동작하는 AI 인프라로 구현하는 작업. Sub Agent(AGENT.md) 파일과 Skill(SKILL.md) 파일을 생성하여, PO가 팀원을 호출하고 반복 업무를 자동화할 수 있는 환경을 구축한다.

---

## 핵심 결정 사항

### 1. Sub Agent 7명 생성 완료

`.claude/agents/` 디렉토리에 팀원별 AGENT.md 파일 생성.

| Agent | 경로 | 설명 |
|---|---|---|
| 김지수 | `.claude/agents/jisu/` | UI/UX 디자이너. Pencil MCP 사용 가능 |
| 잭 도슨 | `.claude/agents/jack/` | 모바일+웹 프론트엔드 |
| 톰 하디 | `.claude/agents/tom-hardy/` | 어드민 프론트엔드 + 프론트 인프라 |
| 이명환 | `.claude/agents/myunghwan/` | 백엔드 아키텍트 |
| 이인수 | `.claude/agents/insoo/` | 백엔드 개발자 |
| 진도준 | `.claude/agents/dojun/` | QA 엔지니어 |
| 톰 크루즈 | `.claude/agents/tom-cruise/` | 데이터 분석가 |

각 AGENT.md에 포함된 내용:
- 정체성/페르소나 (이름, 경력, 성격, 일하는 방식)
- 단독 책임 영역
- 협업 접점 (누구와 무엇을 주고받는지)
- PACE 프로젝트 맥락 (참조 문서 경로 포함)
- 특화 핵심 과제

### 2. Skill ↔ Agent 연결 구조 확정

Skill과 Agent의 관계에 대한 논의를 통해, **Skill이 Agent를 호출하는 연결 구조**를 확정.

```
[호출 경로 1: PO → Skill → Agent]
PO: /design 홈 화면 디자인해줘
→ /design Skill 실행 (context: fork, agent: jisu)
→ 김지수 Agent가 독립 컨텍스트에서 작업
→ 결과 반환

[호출 경로 2: PO → 위더 → Agent]
PO: "검색 화면 디자인이 필요해요"
→ 위더가 판단하여 jisu Agent 호출
→ 결과를 PO에게 보고
```

### 3. Skill 12개 생성 완료

`.claude/skills/` 디렉토리에 생성.

#### 업무 프로세스 Skill (5개)
| Skill | 호출 | 용도 | 실행자 |
|---|---|---|---|
| `/minutes` | 회의록 작성 | 대화 → 회의록 문서화 | 위더 직접 |
| `/decision` | 의사결정 기록 | 확정 결정 → DR 문서 | 위더 직접 |
| `/review` | 기획 문서 리뷰 | 빠진 항목, 모순, 엣지 케이스 점검 | 위더 직접 |
| `/spec` | 기능 명세 초안 | 기능 명세서 생성 | 위더 직접 |
| `/research` | 심층 리서치 | 웹 검색 기반 조사 보고서 | 위더 직접 |

#### 팀원 호출 Skill (7개)
| Skill | 호출 Agent | 특이사항 |
|---|---|---|
| `/design` | 김지수 | **Pencil MCP 활용** — .pen 파일로 실제 시각 디자인 제작 |
| `/frontend` | 잭 도슨 | 모바일+웹 프론트 작업 |
| `/admin-fe` | 톰 하디 | 어드민 웹 + 프론트 인프라 |
| `/backend` | 이명환 | 서버 설계, DB, 아키텍처 |
| `/backend-dev` | 이인수 | API 구현, 인증/결제, 푸시 |
| `/qa` | 진도준 | 테스트, 버그, 에러 케이스 |
| `/data` | 톰 크루즈 | 지표 설계, 분석 모델 |

### 4. 의사결정 기록 체계 확립

회의록(002_minutes)과 별도로, 확정된 의사결정을 `.docs/001_decision-making/` 에 DR(Decision Record) 문서로 관리.
- DR-001 ~ DR-006 작성 완료

### 5. 디자인 시각화 도구: Pencil MCP 활용

- 현재 연결된 Pencil MCP로 실제 시각 디자인 제작 가능
- 모바일 앱, 웹 앱, 디자인 시스템 가이드라인 지원
- 디자인 변수(컬러 토큰, 타이포 스케일) 관리 가능
- Figma MCP는 필요 시 추후 추가 검토

---

## 현재 프로젝트 산출물 구조

```
PACE/
├── .claude/
│   ├── agents/          ← Sub Agent 7명
│   │   ├── jisu/
│   │   ├── jack/
│   │   ├── tom-hardy/
│   │   ├── myunghwan/
│   │   ├── insoo/
│   │   ├── dojun/
│   │   └── tom-cruise/
│   └── skills/          ← Skill 12개
│       ├── minutes/
│       ├── decision/
│       ├── review/
│       ├── spec/
│       ├── research/
│       ├── design/
│       ├── frontend/
│       ├── admin-fe/
│       ├── backend/
│       ├── backend-dev/
│       ├── qa/
│       └── data/
├── .docs/
│   ├── 001_decision-making/  ← 의사결정 기록 (DR-001~006)
│   ├── 002_minutes/          ← 회의록 (01~09)
│   └── (기타 기획 문서)
└── CLAUDE.md
```

---

## 미결 사항

1. **Figma MCP 도입 여부** — PO가 Figma를 사용하는 경우 추가 검토
2. **Skill/Agent 실제 테스트** — 만든 Skill과 Agent가 의도대로 동작하는지 검증 필요
3. **기획 작업 착수** — AI 인프라 구축 완료. Step 3(기능 명세) 시작 가능

## Action Items

- [ ] PO + 위더: Skill/Agent 테스트 (예: `/design`으로 김지수 호출해보기)
- [ ] PO + 위더: Step 3 기능 명세 착수 — AI 스케줄링 알고리즘 논의
- [ ] PO: Figma 사용 여부 결정
