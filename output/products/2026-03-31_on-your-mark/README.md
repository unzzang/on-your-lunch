# Claude Framework

AI 에이전트 팀과 함께 서비스를 기획·개발·출시하기 위한 프레임워크.

---

## 빠른 시작

### 1. 새 프로젝트 생성

```bash
git clone https://github.com/unzzang/claude-framework.git 나의-프로젝트
cd 나의-프로젝트
```

### 2. Git 초기화 (프레임워크 히스토리 제거)

```bash
rm -rf .git
git init
```

### 3. 프로젝트 셋업

Claude Code를 실행하고 `/init` 입력:

```
/init
```

위더가 프로젝트 정보를 하나씩 질문합니다:
- 서비스 이름은?
- 무엇을 하는 서비스인가?
- 핵심 콘셉트는?
- 플랫폼은?
- UX 벤치마크는?
- 타겟 사용자는?

→ 답변 기반으로 **CLAUDE.md가 자동 생성**됩니다.

### 4. 시작!

셋업이 완료되면 Stage 1(사전조사)부터 진행합니다.

---

## 포함된 것

```
.claude/
├── agents/       8명 — 검증자, 디자이너, 프론트(2), 백엔드(2), QA, 데이터
├── skills/       17개 — 에이전트 호출 + 프로세스 + /init
├── processes/    9개 — Stage 0~6 절차서
├── hooks/        2개 — 가짜 데이터 차단, 규칙 주입
├── references/   1개 — 아키텍처 패턴 카탈로그
└── settings.json

.docs/              빈 폴더 구조 (프로젝트 산출물용)
.gitignore          기본 설정
.prettierrc         코드 포매팅 설정
```

---

## 서비스 개발 프로세스 (7 Stage)

| Stage | 이름 | 절차서 | 핵심 |
|-------|------|--------|------|
| 0 | 프로젝트 셋업 | `Project_Setup_Process.md` | `/init`으로 시작 |
| 1 | 사전조사 | `Research_Process.md` | `/research`로 시장 조사 |
| 2 | 기획 | `Planning_Process.md` | 3 Gate (서비스정의→기능설계→기술설계) |
| 3 | 디자인 | `Design_Process.md` | 디자인 시스템→Hi-Fi→핸드오프 |
| 4 | 개발 | `Development_Process.md` | API 계약 먼저 → 기능 단위 개발 |
| 5 | QA | `QA_Process.md` | 4 Phase (정적→통합→기능→재검증) |
| 6 | 출시 | `Launch_Process.md` | 심사 준비→런칭→안정화 |

---

## 주요 Skill 명령어

| 명령 | 용도 |
|------|------|
| `/init` | 프로젝트 초기 셋업 (대화형) |
| `/research` | 시장/경쟁/고객 딥 리서치 |
| `/spec` | 기능 명세서 생성 |
| `/design` | UI/UX 디자이너에게 작업 요청 |
| `/frontend` | 프론트엔드 개발 요청 |
| `/backend` | 백엔드 아키텍처 요청 |
| `/backend-dev` | 백엔드 구현 요청 |
| `/qa` | QA 테스트 요청 |
| `/verify` | 산출물 품질 검증 (검증자) |
| `/decision` | 의사결정 기록 |
| `/minutes` | 회의록 작성 |
| `/review` | 문서 리뷰 |
| `/inbox` | PO에게 확인 요청 |

---

## 프레임워크 업데이트

프로세스나 에이전트가 개선되면 원본 저장소에서 업데이트:

```bash
# 원본 저장소를 remote로 추가 (최초 1회)
git remote add framework https://github.com/unzzang/claude-framework.git

# 업데이트 가져오기
git fetch framework
git merge framework/main --allow-unrelated-histories
```

---

## 핵심 원칙

- **3라운드 정제** — 모든 주요 산출물은 초안→검증→확정 사이클
- **가짜 데이터 금지** — AI가 만든 수치를 문서에 넣지 않음
- **모호 표현 금지** — "적절한", "충분한" 대신 구체적 기준
- **프로젝트 독립적** — `.claude/` 폴더는 어떤 프로젝트에서도 그대로 사용
