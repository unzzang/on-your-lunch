---
> 작성자: 김지수 (UI/UX 디자이너)
> 작성일: 2026-04-01
> 화면 ID: SCR-HOME-001
> 관련 명세: 004_planning/specs/01_lunch_recommendation.md
> 관련 화면설계: 004_planning/screen/01_home.md
> 벤치마크: 배달의민족 홈 화면
> 상태: PO 리뷰 요청
---

# 홈 화면 디자인 명세

## 1. 레이아웃 구조도

```
┌─────────────────────────────────┐
│        Status Bar (44px)         │  ← OS 기본
├─────────────────────────────────┤
│  [온유어런치]            [🔔]    │  ← App Bar (56px)
├─────────────────────────────────┤
│  지수님,                         │  ← Greeting (86px)
│  오늘 점심 뭐 먹을까요?          │
├─────────────────────────────────┤
│  [전체][한식][중식][일식]...      │  ← Category Chips (횡스크롤)
│  [5분|●10분|15분] [~1만|1~2만|2만~] │  ← Sub Filters
├─────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐ │
│  │  [대표 사진]                │ │  ← Card 1
│  │  을지로 골목식당     ♥      │ │
│  │  한식 · 도보 8분 · ~1만원   │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │  [대표 사진]                │ │  ← Card 2
│  │  파스타공방           ♥     │ │
│  │  양식 · 도보 5분 · ~1.5만원 │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │  [대표 사진]                │ │  ← Card 3
│  │  스시히로             ♥     │ │
│  │  일식 · 도보 10분 · ~2만원  │ │
│  └────────────────────────────┘ │
│                                  │
│  [🔄 다른 추천 보기 (4/5)]       │  ← Refresh Button
│                                  │
├─────────────────────────────────┤
│  [🏠홈] [🔍탐색] [📅이력] [👤마이] │  ← Bottom Tab (72px)
└─────────────────────────────────┘
```

## 2. 영역별 상세 명세

### 2-1. App Bar (56px)

- **배경:** `color.bg.primary` (#FFFFFF)
- **좌:** 로고 텍스트 "온유어런치"
  - 텍스트: `typo.h2` (20px, SemiBold), `color.primary` (#FF6B35)
- **우:** 알림 아이콘
  - Phosphor `bell` 24px, `color.text.secondary`
  - 터치 영역: 44×44px
  - MVP에서 비활성 (탭 시 "준비 중이에요" 토스트)
- **패딩:** 좌우 `16px`

### 2-2. Greeting Section (86px)

- **배경:** `color.bg.primary`
- **텍스트:**
  - 1행: "{닉네임}님," — `typo.h1` (24px, Bold), `color.text.primary`
  - 2행: "오늘 점심 뭐 먹을까요?" — `typo.h1`, `color.text.primary`
  - `word-break: keep-all`, `text-wrap: balance`
- **패딩:** 좌우 `16px`, 상 `12px`, 하 `12px`

### 2-3. Filter Section

#### 카테고리 칩 (횡스크롤)

- **활성 칩:**
  - 배경: `color.primary` (#FF6B35)
  - 텍스트: `typo.body2` (14px, Medium), `color.text.inverse` (#FFFFFF)
  - 모서리: `radius.full` (9999px)
  - 패딩: 좌우 `16px`, 상하 `8px`
- **비활성 칩:**
  - 배경: `color.bg.tertiary` (#F3F4F6)
  - 텍스트: `typo.body2` (14px, Medium), `color.text.secondary`
  - Hover: 배경 `color.border.default`
- **간격:** 칩 간 `8px`, 좌우 스크롤 패딩 `16px`
- **항목:** 전체, 한식, 중식, 일식, 양식, 아시안, 분식, 샐러드

#### 서브 필터 (세그먼트)

- **그룹 배경:** `color.bg.tertiary` (#F3F4F6), 모서리 `radius.md` (8px), 패딩 `2px`
- **활성 세그먼트:**
  - 배경: `color.bg.primary` (#FFFFFF)
  - 텍스트: `typo.caption` (12px, Medium), `color.primary`
  - 그림자: `shadow.sm`
  - 모서리: `radius.sm` (4px)
- **비활성 세그먼트:**
  - 배경: transparent
  - 텍스트: `typo.caption` (12px, Regular), `color.text.secondary`
- **도보거리:** 5분 / 10분(기본 활성) / 15분
- **가격대:** ~1만 / 1~2만 / 2만~
- **두 그룹 간 간격:** `12px`

#### 하단 구분선

- `1px solid color.border.default`, 좌우 마진 `0`

### 2-4. Recommendation Cards

#### Card 컴포넌트

- **배경:** `color.bg.primary`
- **모서리:** `radius.lg` (12px)
- **그림자:** `shadow.sm` (0 1px 2px rgba(0,0,0,0.05))
- **카드 간 간격:** `12px`
- **좌우 마진:** `16px`

#### Card 내부

- **이미지 영역:** 높이 `160px`, 상단 모서리만 `radius.lg`
  - 사진 없을 때: 카테고리별 배경색 + 음식 아이콘 (Phosphor `fork-knife` 48px)
  - `loading="lazy"`, `decoding="async"`
- **정보 영역:** 패딩 `16px`
  - **1행:**
    - 식당명: `typo.h3` (18px, SemiBold), `color.text.primary`
    - 즐겨찾기: Phosphor `heart` 24px
      - 비활성: `color.text.placeholder` (#9CA3AF)
      - 활성: `color.primary` (#FF6B35), filled
      - 터치 영역: 44×44px
  - **2행:**
    - 메타 정보: `typo.body2` (14px, Regular), `color.text.secondary`
    - 형식: "카테고리 · 도보 X분 · ~X만원"
    - `font-variant-numeric: tabular-nums` (가격/숫자 정렬)
  - **방문 뱃지 (해당 시):**
    - 배경: `color.bg.tertiary`, 모서리 `radius.sm`
    - 텍스트: `typo.caption`, `color.text.secondary`
    - 형식: "★ 4.0 · 3번 방문"

### 2-5. Refresh Button

- **배경:** `color.bg.secondary` (#F9FAFB)
- **테두리:** `1px solid color.border.default`
- **모서리:** `radius.md` (8px)
- **높이:** 48px
- **좌:** 새로고침 아이콘 Phosphor `arrows-clockwise` 20px, `color.primary`
- **텍스트:** "다른 추천 보기 (4/5)" — `typo.body2` (14px, Medium), `color.text.secondary`
- **아이콘-텍스트 간격:** `8px`
- **좌우 마진:** `16px`
- **상태:**
  - Default → Hover: 배경 `color.bg.tertiary`
  - 소진: 배경 `color.bg.tertiary`, 텍스트 `color.text.placeholder`, 아이콘 `color.text.placeholder`

### 2-6. Bottom Tab Bar (72px, Safe Area 포함)

- **배경:** `color.bg.primary`
- **상단 테두리:** `1px solid color.border.default`
- **하단 패딩:** `28px` (Home Indicator)
- **4탭:**

| 탭 | 아이콘 (Phosphor) | 라벨 |
|---|---|---|
| 홈 | `house` | 홈 |
| 탐색 | `magnifying-glass` | 탐색 |
| 이력 | `calendar-blank` | 이력 |
| 마이 | `user` | 마이 |

- **활성 탭:** 아이콘 + 라벨 `color.primary` (#FF6B35), `typo.overline` (11px, Medium)
- **비활성 탭:** 아이콘 + 라벨 `color.text.placeholder` (#9CA3AF), `typo.overline`
- **아이콘 크기:** 24px
- **터치 영역:** 각 탭 최소 44×44px

## 3. 상태별 UI

### 로딩

- 카드 영역: 스켈레톤 UI
  - 이미지: `color.bg.tertiary` 사각형, shimmer 애니메이션
  - 텍스트: `color.bg.tertiary` 막대 2줄, shimmer
  - 카드 3장 동일 구조
- 필터: 비활성 (탭 불가)
- 애니메이션: shimmer `background-position` 이동, `1.5s infinite`

### 정상 (기본)

- 위 명세 그대로

### 빈 상태 (추천 후보 없음)

- 카드 영역 대체:
  - Phosphor `bowl-food` 아이콘 48px, `color.text.placeholder`
  - "조건에 맞는 식당을 찾지 못했어요" — `typo.body1`, `color.text.secondary`
  - "필터를 바꿔보세요" — `typo.body2`, `color.text.placeholder`
  - [필터 초기화] 버튼 — Button/Secondary 스펙
- 중앙 정렬, 상단 여백 `64px`

### 에러 (네트워크/서버)

- 카드 영역 대체:
  - Phosphor `wifi-slash` 아이콘 48px, `color.text.placeholder`
  - "인터넷 연결을 확인해주세요" — `typo.body1`, `color.text.secondary`
  - [다시 시도] 버튼 — Button/Primary 스펙
- 중앙 정렬, 상단 여백 `64px`

## 4. 인터랙션

| 요소 | 동작 | 결과 | 애니메이션 |
|------|------|------|-----------|
| 추천 카드 | 탭 | 식당 상세 화면 push | push (좌→우, 250ms) |
| 카테고리 칩 | 탭 | 활성/비활성 토글, 추천 즉시 갱신 | fade (150ms) |
| 서브 필터 | 탭 | 단일 선택, 추천 즉시 갱신 | 세그먼트 slide (150ms) |
| 즐겨찾기 하트 | 탭 | 하트 토글, 화면 유지 | scale bounce (200ms) |
| 새로고침 | 탭 | 카드 3장 교체 | 카드 fade-out → fade-in (250ms) |
| 하단 탭 | 탭 | 탭 전환 | none |
| 당겨서 새로고침 | 드래그 | 전체 데이터 리패칭 | 스피너 (iOS 기본) |

모든 인터랙션 easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## 5. 산출물 체크리스트

- [x] 디자인 토큰만 사용 (임의 색상·크기 없음)
- [x] Primary CTA 화면당 1개 (새로고침 버튼은 Secondary)
- [x] 정보 계층 3단계 이내 (h1 인사 → h3 식당명 → body2 메타)
- [x] 로딩·빈 상태·에러 상태 모두 정의
- [x] 모바일 터치 영역 44×44px 이상 (알림, 하트, 탭)
- [x] 텍스트-배경 대비 확인 (#111827 on #FFFFFF = 15.4:1 ✅)
- [x] 벤치마크(배민) 참조 명시
- [x] 데이터 바인딩: {닉네임}, {식당명}, {카테고리}, {도보시간}, {가격대}
- [x] 인터랙션 + 전환 애니메이션 정의
- [x] `word-break: keep-all`, `text-wrap: balance` 적용
- [x] Pretendard 폰트 사용 (Inter 미사용)
- [x] Phosphor Icons 라인 스타일 통일

---

*김지수 드림*
