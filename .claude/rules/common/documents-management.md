# .documents/ 회사 문서 관리 규칙

## 역할

`.documents/`는 **회사 레벨 문서**를 관리하는 공간이다. 프로젝트별 문서(`.docs/`)와 구분한다.

```
.documents/ = 회사 전체에 관한 문서 (전사 회의록, 회사 의사결정)
.docs/      = 개별 프로젝트 산출물 (기획서, 디자인, 리서치)
```

## 폴더 구조

```
.documents/
├── meeting-notes/       ← 회사 레벨 회의록
└── decision-making/     ← 회사 레벨 의사결정 (DR)
```

필요 시 폴더 추가 가능 (전략, 인사 등).

## 작성 규칙

### 템플릿

- 회의록: `.kits/templates/documents/meeting-note.md`
- 의사결정: `.kits/templates/documents/decision-record.md`

### 파일 정리 형식

**월별 폴더** 안에 **날짜(요일)_주제** 파일명으로 저장한다.

```
meeting-notes/
└── {YYYY.MM}/                        ← 월별 폴더
    └── {YYYY-MM-DD}({요일})_{주제}.md  ← 파일

decision-making/
└── {YYYY.MM}/
    └── {YYYY-MM-DD}({요일})_DR-{번호}_{주제}.md
```

예시:
```
meeting-notes/
└── 2026.03/
    └── 2026-03-31(화)_회사구조수립.md

decision-making/
└── 2026.04/
    └── 2026-04-01(수)_DR-001_디자인도구선정.md
```

### 요일 표기

월, 화, 수, 목, 금, 토, 일

## 회사 vs 프로젝트 구분 기준

| 내용 | 저장 위치 |
|------|----------|
| 팀 구성 변경 | `.documents/decision-making/` |
| 도구 변경 (Figma 도입 등) | `.documents/decision-making/` |
| 사업 방향 논의 | `.documents/meeting-notes/` |
| PACE 기능 명세 | 프로젝트 `.docs/planning/specs/` |
| PACE 디자인 DR | 프로젝트 `.docs/decision-making/` |
