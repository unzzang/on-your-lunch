# output/ 프로젝트 산출물 관리 규칙

## 역할

`output/`은 회사에서 진행하는 **모든 프로젝트의 실제 산출물**이 저장되는 공간이다.

```
efforts/ = 현황판 (카드만 — 프로젝트를 가리키는 포인터)
output/  = 실제 산출물 (프로젝트 코드, 문서, 디자인)
```

## 폴더 구조

```
output/
├── product/              ← 서비스 프로덕트 프로젝트
│   ├── {시작일}_{프로젝트명}/
│   │   ├── docs/           문서 산출물
│   │   ├── design/         디자인 산출물
│   │   └── src/            개발 산출물
│   └── ...
└── contents/             ← 콘텐츠 프로젝트 (블로그, 영상)
```

## 프로젝트 폴더 네이밍

`{YYYY-MM-DD}_{프로젝트명}/`

예시:
- `2026-03-31_PACE/`
- `2026-03-31_on-your-lunch/`

## 프로젝트 내부 구조

각 프로젝트 폴더는 `docs/` + `design/` + `src/`로 구성:

```
{프로젝트}/
├── docs/                 ← 프로젝트 문서 산출물
│   ├── 000_inbox/
│   ├── 001_decision-making/
│   ├── 002_meeting-notes/
│   ├── 003_research/
│   ├── 004_planning/
│   └── 999_references/
├── design/               ← 프로젝트 디자인 산출물
├── src/                  ← 프로젝트 코드
└── CLAUDE.md             ← 프로젝트별 설정 (기술 스택, 명령어 등)
```

## .efforts 카드와의 연결

`efforts/` 카드의 "프로젝트 경로"에 `output/` 상대 경로를 기재:

```
## 프로젝트 경로
- 프로젝트 폴더: output/product/2026-03-31_PACE/
```

## 회사 .claude/와의 관계

프로젝트가 `output/` 안에 있으므로, 회사 루트의 `.claude/`(agents, skills, rules)를 **자동으로 인식**한다. 프로젝트별로 별도 `.claude/`를 만들 필요 없음.
