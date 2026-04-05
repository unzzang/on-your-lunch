---
name: create-project
description: 새 프로젝트를 대화형으로 셋업합니다. 프로젝트 정보를 단계별로 수집하여 CLAUDE.md와 폴더 구조를 자동 생성합니다. "새 프로젝트", "프로젝트 생성", "셋업" 키워드가 나오면 이 스킬을 사용하세요.
---

# 프로젝트 초기화 (대화형 셋업)

새 프로젝트를 시작할 때 실행한다. 상세 절차는 `processes/Project_Setup_Process.md`를 참조한다.

## 작업 기준

### 핵심 절차

1. **프로젝트 정보 수집** — 한 번에 한 질문씩, 대화형으로 진행
   - 서비스명, 핵심 문제, 차별점, 플랫폼, UX 벤치마크, 타겟 사용자
2. **GitHub 레포 생성** — 프로젝트 전용 레포 자동 생성 + 라벨 셋업
3. **CLAUDE.md 생성** — 수집한 정보로 프로젝트 설명서 자동 작성 (AI 파트너는 "위더"로 고정)
4. **폴더 구조 생성** — `.docs/` 하위 폴더 생성 (`rules/common/folder-structure.md` 참조)
5. **efforts 카드 생성** — `.efforts/001_On/`에 프로젝트 카드 생성
6. **git subtree 연결** — 프로젝트 폴더를 전용 레포에 push

### 규칙

- 한 번에 한 질문만 한다
- 사용자의 답변을 기다린다 (스스로 답하지 않는다)
- 예시를 함께 제시한다
- `src/`는 이 시점에 생성하지 않는다 (개발 착수 시 확정)
- AI 파트너 이름은 **위더**로 고정 (프로젝트별 다른 이름 사용하지 않음)

## GitHub 레포 생성 절차

프로젝트 정보 수집 완료 후 자동 실행한다.

### 레포명 규칙

서비스명을 영문 kebab-case로 변환한다.
- 온유어런치 → `on-your-lunch`
- 주차서비스 → `parking-service`
- PACE → `pace`

### 실행 명령

```bash
# 1. 레포 생성 (비공개)
gh repo create unzzang/{레포명} --private --description "{서비스 한줄 설명}"

# 2. remote 추가
git remote add {레포명} https://github.com/unzzang/{레포명}.git

# 3. 라벨 셋업
REPO="unzzang/{레포명}"
gh label create "stage:개발" --color "0E8A16" --description "Stage 4 개발" --repo $REPO
gh label create "stage:QA" --color "D93F0B" --description "Stage 5 QA" --repo $REPO
gh label create "개발:프론트" --color "FBCA04" --description "프론트엔드 작업" --repo $REPO
gh label create "개발:백엔드" --color "B60205" --description "백엔드 작업" --repo $REPO
gh label create "개발:연동" --color "5319E7" --description "프론트↔백엔드 연동" --repo $REPO
gh label create "디자인검수" --color "F9D0C4" --description "디자인 대조 검수" --repo $REPO
gh label create "심각도:상" --color "B60205" --description "핵심 기능 불가" --repo $REPO
gh label create "심각도:중" --color "D93F0B" --description "기능 동작하나 불완전" --repo $REPO
gh label create "심각도:하" --color "FBCA04" --description "개선하면 좋은 수준" --repo $REPO
gh label create "상태:수정중" --color "1D76DB" --description "개발팀 수정 진행 중" --repo $REPO
gh label create "상태:재검증" --color "0E8A16" --description "수정 후 QA 재검증 대기" --repo $REPO

# 4. 폴더 생성 후 subtree push
git subtree push --prefix=.output/products/{날짜}_{프로젝트명} {레포명} main
```

### push 규칙

커밋 후 두 레포에 push한다:
```bash
git push origin main                                                    # 회사 레포
git subtree push --prefix=.output/products/{폴더명} {레포명} main       # 프로젝트 레포
```

## 산출물

| 산출물 | 저장 위치 |
|--------|----------|
| GitHub 레포 | `https://github.com/unzzang/{레포명}` |
| 프로젝트 설명서 | `.output/products/{날짜}_{프로젝트명}/CLAUDE.md` |
| 문서 폴더 구조 | `.output/products/{날짜}_{프로젝트명}/.docs/` 하위 |
| 프로젝트 카드 | `.efforts/001_On/{날짜}({요일})_{프로젝트명}.md` |
