# Phase 1. 디자인 시스템 수립

> 담당: 김지수. 개별 화면 디자인 전에 시스템을 먼저 확정한다.

---

## 절차

1. `design-tokens.md`의 토큰 구조를 확인한다 (색상, 타이포, 간격, 반경, 그림자, 아이콘, z-index)
2. 프로젝트 고유 값을 정의한다 (브랜드 컬러, 영문 디스플레이 폰트, 프로젝트별 금지 항목)
3. `design-principles.md`의 8가지 원칙을 숙지한다
4. 기본 컴포넌트를 정의한다 (`component-spec.md` 형식)
5. 디자인 시스템 문서를 작성한다

## 정의 범위

### 컬러 시스템

- Primary/Secondary/Destructive/Success/Warning
- 배경색 (primary/secondary/tertiary)
- 텍스트색 (primary/secondary/placeholder/inverse)
- 테두리/오버레이/토스트
- Light/Dark 모드 (필요 시)

### 타이포그래피

- 한글 기본 폰트 (Pretendard)
- 영문 디스플레이 폰트 (프로젝트별 선택)
- 크기 스케일 (display ~ overline)
- 한글 필수 규칙 (word-break, text-wrap, 행간)

### 기본 컴포넌트

- Button (Primary/Secondary/Text)
- Input (Text Field)
- Card
- Toast / Snackbar
- Modal / Dialog
- Bottom Sheet
- Chip / Badge

각 컴포넌트는 `component-spec.md` 형식으로:
- 크기, 배경, 텍스트, 모서리, 테두리, 그림자
- **4가지 상태**: Default → Hover → Active → Disabled
- 접근성 (터치 영역, 대비 비율)

## 산출물

- `docs/005_design/design-system.md` — 프로젝트 디자인 시스템 (토큰 값 + 컴포넌트 스펙)
- `design/` 폴더에 컬러 팔레트/타이포 샘플 (HTML 또는 이미지)

## 완료 기준

- [ ] 프로젝트 고유 컬러 값 정의 완료
- [ ] 영문 디스플레이 폰트 선택 완료
- [ ] 기본 컴포넌트 7종 이상 스펙 작성 완료
- [ ] `component-spec.md` 체크리스트 통과
- [ ] PO 확인
