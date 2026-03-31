# 프로젝트 셋업 프로세스 (Stage 0)

> 적용 범위: 새 프로젝트를 시작할 때 최초 1회
> 책임자: PO
> 선행 조건: 없음

---

## 1. 역할

프로젝트 저장소를 초기화하고, AI 협업 환경을 구성한다.

## 2. 프로세스

### Step 1. Clone

```bash
git clone {템플릿_저장소_URL} {프로젝트명}
cd {프로젝트명}
rm -rf .git
git init
```

템플릿 저장소에는 `.claude/` (agents, skills, processes, hooks, references, rules)가 포함되어 있다. 프로젝트별 고유 파일(`.docs/`, `src/`)은 비어 있다.

### Step 2. /init 실행

PO가 `/init` 스킬을 실행하면 대화형으로 아래를 수행한다:

1. 프로젝트 기본 정보 입력 (이름, 한줄 설명, 핵심 콘셉트)
2. `.docs/` 폴더 구조 생성 (`rules/folder-structure.md` 참조)
3. `CLAUDE.md` 생성 (프로젝트 개요, 기술 스택은 Stage 2에서 확정)

## 3. 완료 기준

- [ ] git 저장소 초기화 완료
- [ ] `.claude/` 구조 정상 (agents, skills, processes, hooks, references, rules)
- [ ] `.docs/` 폴더 구조 생성 완료
- [ ] `CLAUDE.md` 생성 완료
- [ ] 첫 커밋 완료
