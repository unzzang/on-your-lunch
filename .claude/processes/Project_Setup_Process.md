# 프로젝트 셋업 프로세스 (Stage 0)

> 적용 범위: 새 프로젝트를 시작할 때 최초 1회
> 책임자: PO
> 선행 조건: 없음
> 스킬: `/create-project`

---

## 1. 역할

프로젝트 폴더를 생성하고, 문서/디자인/코드 구조를 초기화하고, 현황판에 등록한다.

---

## 2. 프로세스

### Step 1. 프로젝트 폴더 생성

`output/products/` 아래에 프로젝트 폴더를 생성한다.

**폴더명 규칙:** `{YYYY-MM-DD}_{프로젝트명}/`

```bash
mkdir -p output/products/{YYYY-MM-DD}_{프로젝트명}
```

예시: `output/products/2026-03-31_on-your-lunch/`

### Step 2. 내부 폴더 구조 생성

프로젝트 폴더 안에 3가지 영역을 생성한다.

```bash
cd output/products/{YYYY-MM-DD}_{프로젝트명}

# 문서 산출물
mkdir -p docs/000_inbox
mkdir -p docs/001_decision-making
mkdir -p docs/002_meeting-notes
mkdir -p docs/003_research
mkdir -p docs/004_planning/specs
mkdir -p docs/004_planning/screen
mkdir -p docs/004_planning/tech-spec
mkdir -p docs/004_planning/erd
mkdir -p docs/004_planning/qa
mkdir -p docs/005_design
mkdir -p docs/999_references

# 디자인 산출물
mkdir -p design
mkdir -p design/assets

# 코드 (Stage 4에서 초기화)
mkdir -p src
```

### Step 3. CLAUDE.md 생성

프로젝트 루트에 `CLAUDE.md`를 생성한다. 아래 항목을 포함:

- 프로젝트 이름, 한줄 설명
- 현재 Stage (Stage 0)
- 기술 스택 (Stage 2에서 확정, 초기에는 "미정")
- 빠른 명령어 (Stage 4에서 추가)

### Step 4. efforts/ 현황판 카드 생성

`kits/templates/documents/effort-card.md`를 복사하여 `efforts/001_On/`에 카드를 생성한다.

**파일명:** `{YYYY-MM-DD}({요일})_{프로젝트명}.md`

카드에 포함:
- 프로젝트 개요 (1~2문장)
- 현재 Stage: Stage 0
- 프로젝트 폴더 경로: `output/products/{YYYY-MM-DD}_{프로젝트명}/`

### Step 5. 첫 커밋

```bash
git add .
git commit -m "🎉 init : {프로젝트명} 프로젝트 셋업"
```

---

## 3. 완료 기준

- [ ] 프로젝트 폴더 생성 (`output/products/{날짜}_{이름}/`)
- [ ] docs/ 폴더 구조 생성 (000~999)
- [ ] design/ 폴더 생성 (+ assets/)
- [ ] src/ 폴더 생성
- [ ] CLAUDE.md 생성
- [ ] efforts/ 현황판 카드 생성 (001_On/)
- [ ] 첫 커밋 완료
