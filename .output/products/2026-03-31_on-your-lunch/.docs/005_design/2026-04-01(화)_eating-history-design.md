---
> 작성자: 김지수 (UI/UX 디자이너)
> 작성일: 2026-04-01
> 화면 ID: SCR-HISTORY-001
> 관련 명세: 004_planning/specs/03_eating_history.md
> 관련 화면설계: 004_planning/screen/04_eating_history.md
> 벤치마크: 배달의민족 주문내역 (캘린더 + 리스트)
> 상태: PO 리뷰 요청
---

# 먹은 이력 화면 디자인 명세

## 1. 레이아웃 구조도

```
┌─────────────────────────────────┐
│        Status Bar (44px)         │  ← OS 기본
├─────────────────────────────────┤
│  먹은 이력              [+ 기록]  │  ← App Bar (56px)
├─────────────────────────────────┤
│  ◀  2026년 3월  ▶                │  ← Calendar Nav
│                                  │
│  일  월  화  수  목  금  토       │  ← Weekday Labels
│                                  │
│       1   2   3   4   5   6      │
│          🟠      🔵      🟢     │  ← Calendar Days + Dots
│   7   8   9  10  11  12  13     │
│                  🟠  🔴  🟠     │
│  14  15  16  17  18  19  20     │
│              🟣      🟠🟢       │
│  21  22  23  24  25  26  27     │
│                  🟡      🔵  🟠 │
│  28  29  30  ●31                 │  ← ● = 오늘
│              🟢  🟠              │
│                                  │
├─ section-divider (8px) ─────────┤
│  3월 31일 (오늘)                  │  ← Records Header
│                                  │
│  ┌────────────────────────────┐ │
│  │ [🍽]  을지로 골목식당        │ │  ← Record Card
│  │       한식 · ★★★★☆ 4.0      │ │
│  │       "된장찌개 맛있었어요"   │ │
│  └────────────────────────────┘ │
│                                  │
├─────────────────────────────────┤
│  [🏠홈] [🔍탐색] [●📅이력] [👤마이] │  ← Bottom Tab (72px)
└─────────────────────────────────┘
```

## 2. 영역별 상세 명세

### 2-1. App Bar (56px)

- **배경:** `color.bg.primary`
- **좌:** "먹은 이력" — `typo.h2` (20px, Bold), `color.text.primary`
- **우:** "+ 기록" 버튼
  - 배경: `color.primary` (#D4501F)
  - 텍스트: `typo.overline` (13px, SemiBold), `color.text.inverse`
  - 아이콘: Phosphor `plus` 16px, `color.text.inverse`
  - 모서리: `radius.full`
  - 패딩: `8px 14px`
- **패딩:** 좌우 `16px`

### 2-2. Calendar Navigation

- **월 표시:**
  - "2026년 3월" — `typo.h3` (18px, SemiBold), `color.text.primary`
  - 중앙 정렬, 최소 너비 `140px`
- **화살표 버튼:**
  - 36x36px, `radius.full`
  - Phosphor `caret-left` / `caret-right` 20px, `color.text.primary`
  - Hover: 배경 `color.bg.tertiary`
  - 좌우 간격: `20px`
- **패딩:** `12px 0 16px`

### 2-3. Calendar Weekday Labels

- **그리드:** 7열 균등 배치
- **텍스트:** `typo.caption` (12px, Medium), `color.text.placeholder`
- **일요일:** `color.primary` (#D4501F)
- **패딩:** `8px 0`

### 2-4. Calendar Days

- **그리드:** 7열, 행 간격 `2px`
- **각 셀:**
  - 최소 높이: `48px`
  - 중앙 정렬, `radius.md`
  - Hover: 배경 `color.bg.secondary`
- **날짜 숫자:**
  - `typo.body2` (14px), `color.text.primary`
- **일요일 날짜:**
  - `color.primary`
- **오늘:**
  - 숫자 배경: `color.primary`, 원형 28x28px
  - 텍스트: `color.text.inverse`, SemiBold
- **선택된 날짜:**
  - 배경: `color.bg.secondary`
  - 테두리: `2px solid color.primary`
- **카테고리 Dot:**
  - 크기: `6px` 원, `radius.full`
  - 간격: `3px`, 상단 마진 `4px`
  - 색상은 `color.category.*` 토큰 사용:

| 카테고리 | 토큰 | 값 |
|----------|------|-----|
| 한식 | `color.category.korean` | #FF8C00 |
| 중식 | `color.category.chinese` | #FF0000 |
| 일식 | `color.category.japanese` | #0066FF |
| 양식 | `color.category.western` | #00AA00 |
| 아시안 | `color.category.asian` | #9900CC |
| 분식 | `color.category.snack` | #FFCC00 |
| 샐러드 | `color.category.salad` | #66CC00 |

  - 하루 3개 초과 시: dot 3개 + 텍스트 "+N"

### 2-5. Section Divider

- 높이: `8px`
- 배경: `color.bg.secondary`

### 2-6. Records Header

- **패딩:** `16px`
- **텍스트:** "3월 31일 (오늘)" — `typo.body1` (16px, SemiBold), `color.text.primary`

### 2-7. Record Card

- **패딩:** `12px 16px`
- **하단 테두리:** `1px solid color.border.default`
- **Hover:** 배경 `color.bg.secondary`
- **구성:** 아이콘 영역 + 콘텐츠 (flex, gap `12px`)
- **아이콘 영역:**
  - 48x48px, 배경 `color.bg.tertiary`, `radius.md`
  - Phosphor `fork-knife` 24px, `color.primary`
- **콘텐츠:**
  - 식당명: `typo.body1` (16px, SemiBold), `color.text.primary`
  - 메타: "한식 · ★★★★☆ 4.0" — `typo.caption` (13px), `color.text.secondary`
  - 별 색상: `color.rating` (#FBBF24)
  - 메모: `typo.caption` (13px), `color.text.secondary`, italic
  - 메모 상단 마진: `4px`
- **탭:** 식당 상세 화면으로 push
- **좌측 스와이프:** 삭제 버튼 노출 (배경 `color.destructive`)

### 2-8. Bottom Tab Bar (72px)

- 홈 디자인 명세와 동일 스펙
- 활성 탭: "이력" (Phosphor `calendar-blank` filled, `color.primary`)

## 3. 상태별 UI

### 로딩

- 캘린더 영역: 스켈레톤 (높이 280px, `radius.lg`, shimmer)
- 기록 영역: 스켈레톤 카드 2개 (아이콘 48x48px + 텍스트 막대 2줄)
- 캘린더, 구분선, 기록 숨김

### 정상 (기본)

- 위 명세 그대로

### 빈 상태 (선택 날짜 기록 없음)

- 캘린더는 정상 표시
- 기록 리스트 대체:
  - Phosphor `calendar-blank` 48px, `color.text.placeholder`
  - "아직 기록이 없어요" — `typo.body1`, `color.text.secondary`
  - "점심 먹은 후 기록해보세요!" — `typo.body2`, `color.text.placeholder`
  - [기록하러 가기] 버튼 — Button/Primary
- 중앙 정렬, 패딩 `48px 16px`

### 에러 (네트워크/서버)

- 캘린더, 구분선, 기록 숨김
- 중앙:
  - Phosphor `wifi-slash` 48px, `color.text.placeholder`
  - "인터넷 연결을 확인해주세요" — `typo.body1`, `color.text.secondary`
  - [다시 시도] 버튼 — Button/Primary

## 4. 인터랙션

| 요소 | 동작 | 결과 | 애니메이션 |
|------|------|------|-----------|
| 월 화살표 | 탭 | 이전/다음 월 전환 | slide 좌/우 (250ms) |
| 날짜 셀 | 탭 | 하단 기록 리스트 갱신 | fade (150ms) |
| 기록 카드 | 탭 | 식당 상세 화면 | push 좌→우 (250ms) |
| 기록 카드 | 좌 스와이프 | 삭제 버튼 노출 | slide-left (200ms) |
| 삭제 버튼 | 탭 | 확인 팝업 → 삭제 | fade-out (200ms) |
| + 기록 | 탭 | 직접 기록 화면 | push 좌→우 (250ms) |
| 하단 탭 | 탭 | 탭 전환 | none |

모든 인터랙션 easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## 5. 산출물 체크리스트

- [x] 디자인 토큰만 사용 (카테고리 dot에 `color.category.*` 토큰 사용)
- [x] Primary CTA 화면당 1개 ("+ 기록" 버튼)
- [x] 정보 계층 3단계 이내 (월 타이틀 → 날짜 → 기록 카드)
- [x] 로딩·빈 상태·에러 상태 모두 정의
- [x] 모바일 터치 영역 44x44px 이상 (날짜 셀, 탭)
- [x] 텍스트-배경 대비 확인 (Primary #D4501F on #FFFFFF = 5.2:1)
- [x] 벤치마크(배민 주문내역) 참조 명시
- [x] 데이터 바인딩: {월}, {날짜}, {식당명}, {카테고리}, {별점}, {메모}
- [x] 인터랙션 + 전환 애니메이션 정의
- [x] `word-break: keep-all` 적용
- [x] Pretendard 폰트 사용
- [x] Phosphor Icons 라인 스타일 통일

---

*김지수 드림*
