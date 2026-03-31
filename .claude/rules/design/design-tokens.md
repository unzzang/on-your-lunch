# 디자인 토큰 표준

> 이 문서는 **토큰의 구조**를 정의한다. 값은 프로젝트마다 다르다.
> 프로젝트 고유 값은 `.docs/005_design/design-system.md`에 정의한다.
> 아래 기본값은 프로젝트에서 별도 정의하지 않은 경우에만 적용한다.

## 색상 토큰

> Light/Dark 모드가 필요한 프로젝트는 프로젝트 디자인 시스템에서 Dark 값을 별도 정의한다.

| 토큰 이름 | 용도 | 기본값 (Light) |
|----------|------|---------------|
| `color.primary` | 주 행동(CTA), 브랜드 강조 | #2563EB |
| `color.primary.hover` | Primary 호버 | #1D4ED8 |
| `color.primary.disabled` | Primary 비활성 | #93C5FD |
| `color.secondary` | 보조 버튼, 부제목 | #6B7280 |
| `color.destructive` | 삭제, 위험 행동 | #DC2626 |
| `color.success` | 성공, 완료 상태 | #16A34A |
| `color.warning` | 경고, 주의 | #F59E0B |
| `color.bg.primary` | 페이지 배경 | #FFFFFF |
| `color.bg.secondary` | 카드/섹션 배경 | #F9FAFB |
| `color.bg.tertiary` | 인풋 필드, 비활성 영역 | #F3F4F6 |
| `color.border.default` | 기본 구분선 | #E5E7EB |
| `color.border.focus` | 포커스 링 | #2563EB |
| `color.text.primary` | 본문, 제목 | #111827 |
| `color.text.secondary` | 부가 설명, 캡션 | #6B7280 |
| `color.text.placeholder` | 인풋 플레이스홀더 | #9CA3AF |
| `color.text.inverse` | 어두운 배경 위 텍스트 | #FFFFFF |
| `color.overlay` | 모달/바텀시트 오버레이 | #000000 50% |
| `color.toast.bg` | 토스트/스낵바 배경 | #1F2937 |

## 타이포그래피 토큰

### 폰트 스택

| 용도 | 폰트 | 비고 |
|------|------|------|
| 한글 기본 | **Pretendard** | fallback: -apple-system, system-ui, sans-serif |
| 영문 디스플레이 | Geist, Outfit, Cabinet Grotesk, Satoshi 중 택1 | 프로젝트별 선택 |
| 숫자 | `font-variant-numeric: tabular-nums` | 고정폭으로 정렬 |

### 크기 스케일

| 토큰 이름 | 크기 | 굵기 | 행간 | 자간 | 사용처 |
|----------|------|------|------|------|--------|
| `typo.display` | 28px | Bold(700) | 36px | tight | 대형 숫자, 히어로 |
| `typo.h1` | 24px | Bold(700) | 32px | tight | 페이지 타이틀 |
| `typo.h2` | 20px | SemiBold(600) | 28px | tight | 섹션 타이틀 |
| `typo.h3` | 18px | SemiBold(600) | 26px | normal | 카드 타이틀 |
| `typo.body1` | 16px | Regular(400) | 24px | normal | 기본 본문 |
| `typo.body2` | 14px | Regular(400) | 20px | normal | 보조 본문, 리스트 |
| `typo.caption` | 12px | Regular(400) | 16px | normal | 타임스탬프, 힌트 |
| `typo.overline` | 11px | Medium(500) | 16px | wide | 레이블, 카테고리 태그 |

### 한글 타이포그래피 필수 규칙

| 규칙 | 적용 | 이유 |
|------|------|------|
| `word-break: keep-all` | 모든 한글 텍스트 블록 | 한글은 이 속성 없이 글자 중간에서 줄바꿈됨 |
| `text-wrap: balance` | 제목 (h1, h2, h3) | 마지막 줄에 단어 1개만 남는 고아 단어 방지 |
| 본문 최대 너비 | ~65자 (약 32em) | 한 줄이 너무 길면 시선 이동이 힘듦 |
| 행간 (한글) | 영문보다 넓게 | 한글은 글자 높이가 균일해서 넓은 행간이 필요 |
| 경어체 통일 | 프로젝트 내 | 합니다체/하세요체 중 택1, 혼용 금지 |

### 한글 카피 금지 표현

AI가 생성하기 쉬운 번역투/클리셰를 사용하지 않는다:

❌ "혁신적인", "원활한", "차세대", "게임 체인저", "솔루션"
❌ "지금 바로 시작하세요" (맥락 없는 CTA)
❌ "Lorem ipsum" 또는 영문 더미 텍스트
✅ 자연스러운 한글 구어체. 실제 서비스에 맞는 구체적 문구.

## 간격 (Spacing)

> 4px 그리드 기반. 아래 값만 사용한다.

`4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80`

| 용도 | 값 |
|------|---|
| 아이콘–텍스트 간격 | 8px |
| 컴포넌트 내부 패딩 (최소) | 12px |
| 인풋 내부 패딩 | 12px 16px (상하 좌우) |
| 카드 내부 패딩 | 16px (모바일) / 20~24px (웹) |
| 리스트 아이템 간 간격 | 8px 또는 12px |
| 섹션 간 간격 | 24px (모바일) / 32px (웹) |
| 페이지 좌우 마진 | 16px (모바일) / 24~32px (웹) |

## 모서리 반경 (Border Radius)

| 토큰 이름 | 값 | 대상 |
|----------|------|------|
| `radius.sm` | 4px | 뱃지, 태그 |
| `radius.md` | 8px | 버튼, 인풋, 칩 |
| `radius.lg` | 12px | 카드, 드롭다운 |
| `radius.xl` | 16px | 모달, 바텀시트 |
| `radius.full` | 9999px | 아바타, 필(pill) 뱃지 |

## 그림자 (Elevation)

| 레벨 | 값 | 대상 |
|------|---|------|
| `shadow.sm` | 0 1px 2px rgba(0,0,0,0.05) | 카드 기본 |
| `shadow.md` | 0 4px 6px rgba(0,0,0,0.07) | 드롭다운, 팝오버 |
| `shadow.lg` | 0 10px 15px rgba(0,0,0,0.10) | 모달, 바텀시트 |

## 아이콘

- 스타일: Line (outlined), 굵기 1.5px
- 크기: 16px(인라인) / 20px(버튼 내부) / 24px(내비게이션)
- 색상: `color.text.primary` 또는 `color.text.secondary`

## Z-index 계층

| 요소 | z-index |
|------|---------|
| 콘텐츠 기본 | 0 |
| 스티키 헤더 | 100 |
| 드롭다운/팝오버 | 200 |
| 모달 오버레이 | 300 |
| 모달 | 400 |
| 토스트/스낵바 | 500 |
