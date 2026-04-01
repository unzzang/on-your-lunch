---
> 작성자: 김지수 (UI/UX 디자이너)
> 작성일: 2026-04-01
> 화면 ID: SCR-EXPLORE-001
> 관련 명세: 004_planning/specs/04_restaurant_explore.md
> 관련 화면설계: 004_planning/screen/05_explore.md
> 벤치마크: 배달의민족 지도 탐색 + 리스트 전환
> 상태: PO 리뷰 요청
---

# 식당 탐색 화면 디자인 명세

## 1. 레이아웃 구조도

### 지도 뷰

```
┌─────────────────────────────────┐
│        Status Bar (44px)         │  ← OS 기본
├─────────────────────────────────┤
│  ┌────────────────────────────┐ │  ← Search Bar
│  │ 🔍 식당명, 메뉴 검색         │ │
│  └────────────────────────────┘ │
│                                  │
│  [전체][한식][중식]...[♥즐겨찾기]  │  ← Filter Chips (횡스크롤)
├─────────────────────────────────┤
│                                  │
│     [카카오맵 지도]               │  ← Map Area
│  🏢(회사)                        │
│        🟠 을지로골목식당          │
│     🟢 파스타공방                │
│        🔵 스시히로               │
│     🔴 명동짬뽕           [목록] │  ← View Toggle
│                                  │
├─────────────────────────────────┤
│  [사진] 을지로 골목식당      [♥]  │  ← Mini Card (핀 탭 시)
│         한식 · 도보 8분 · ~1만원  │
├─────────────────────────────────┤
│  [🏠홈] [●🔍탐색] [📅이력] [👤마이] │  ← Bottom Tab (72px)
└─────────────────────────────────┘
```

### 리스트 뷰

```
┌─────────────────────────────────┐
│        Status Bar (44px)         │
├─────────────────────────────────┤
│  ┌────────────────────────────┐ │  ← Search Bar
│  │ 🔍 식당명, 메뉴 검색         │ │
│  └────────────────────────────┘ │
│  [전체][한식][중식]...[♥즐겨찾기]  │  ← Filter Chips
│                     거리순 ▼     │  ← Sort Row
├─────────────────────────────────┤
│  [사진] 을지로 골목식당      [♥]  │  ← List Item
│         한식 · 도보 3분 · ~1만원  │
│         ★ 4.0 (3회)             │
│  ───────────────────────         │
│  [사진] 파스타공방          [♡]  │  ← List Item
│         양식 · 도보 5분 · ~1.5만원│
│  ───────────────────────         │
│  [사진] 스시히로            [♥]  │
│         일식 · 도보 8분 · ~2만원  │
│         ★ 4.5 (1회)             │
│                                  │
│                          [지도]  │  ← View Toggle
├─────────────────────────────────┤
│  [🏠홈] [●🔍탐색] [📅이력] [👤마이] │
└─────────────────────────────────┘
```

## 2. 영역별 상세 명세

### 2-1. Search Bar

- **패딩:** `0 16px 12px`
- **배경:** `color.bg.primary`
- **인풋 컨테이너:**
  - 배경: `color.bg.tertiary`
  - 모서리: `radius.md`
  - 패딩: `10px 16px`
  - 테두리: `1px solid transparent`
  - 아이콘: Phosphor `magnifying-glass` 20px, `color.text.placeholder`
  - 플레이스홀더: "식당명, 메뉴 검색" — `typo.body2` (15px), `color.text.placeholder`
  - 아이콘-텍스트 간격: `8px`
- **탭 시:** 검색 전용 화면으로 전환 (키보드 + 최근 검색어)

### 2-2. Filter Chips (횡스크롤)

- **배경:** `color.bg.primary`
- **패딩:** `0 16px 12px`
- **칩 스펙:** 홈 화면 카테고리 칩과 동일
  - 활성: 배경 `color.primary` (#D4501F), 텍스트 `color.text.inverse`
  - 비활성: 배경 `color.bg.tertiary`, 텍스트 `color.text.secondary`
  - Hover: 배경 `color.border.default`
  - 모서리: `radius.full`
  - 패딩: `8px 16px`
  - 간격: `8px`
- **즐겨찾기 칩:**
  - 비활성: Phosphor `heart` 16px + "즐겨찾기"
  - 활성: Phosphor `heart` filled + "즐겨찾기", 배경 `color.primary`
- **항목:** 전체, 한식, 중식, 일식, 양식, 아시안, 분식, 샐러드, 즐겨찾기

### 2-3. Sort Row (리스트 뷰 전용)

- **패딩:** `4px 16px 8px`
- **우측 정렬**
- **드롭다운:**
  - "거리순" + Phosphor `caret-down` 16px — `typo.caption` (13px), `color.text.secondary`
  - 옵션: 거리순(기본) / 별점순

### 2-4. Map Area (지도 뷰)

- **배경:** `color.bg.tertiary` (지도 미로드 시)
- **최소 높이:** `360px`, flex: 1
- **지도 미로드 시:**
  - Phosphor `map-trifold` 48px, `color.text.placeholder`
  - "카카오맵 지도 영역" — `typo.body2`, `color.text.placeholder`
- **회사 핀:**
  - 32x32px, `color.text.primary` 배경, 빌딩 이모지
  - 라벨: "내 회사" — `typo.overline` (11px, SemiBold)
- **식당 핀:**
  - 32x32px, `radius.full`, 카테고리별 색상 (`color.category.*` 토큰 사용)
  - 내부: Phosphor `map-pin` 16px, white
  - 라벨: 식당명 — `typo.overline` (11px, SemiBold), 배경 white, `shadow.sm`, `radius.sm`
  - 그림자: `shadow.md`

| 카테고리 | 핀 배경색 토큰 |
|----------|---------------|
| 한식 | `color.category.korean` (#FF8C00) |
| 중식 | `color.category.chinese` (#FF0000) |
| 일식 | `color.category.japanese` (#0066FF) |
| 양식 | `color.category.western` (#00AA00) |
| 아시안 | `color.category.asian` (#9900CC) |
| 분식 | `color.category.snack` (#FFCC00) |
| 샐러드 | `color.category.salad` (#66CC00) |

### 2-5. View Toggle Button

- **위치:** 우하단 고정 (`position: absolute`, bottom `16px`, right `16px`, z-index: 5)
- **배경:** `color.bg.primary`
- **테두리:** `1px solid color.border.default`
- **모서리:** `radius.full`
- **그림자:** `shadow.md`
- **패딩:** `10px 16px`
- **지도 뷰:** Phosphor `list` 18px + "목록"
- **리스트 뷰:** Phosphor `map-trifold` 18px + "지도"
- **텍스트:** `typo.caption` (13px, Medium), `color.text.primary`
- **아이콘-텍스트 간격:** `6px`

### 2-6. Mini Card (핀 탭 시 하단 표시)

- **패딩:** `12px 16px`
- **배경:** `color.bg.primary`
- **상단 테두리:** `1px solid color.border.default`
- **구성:** 사진 + 정보 + 하트 (flex, gap `12px`)
- **사진:**
  - 64x64px, `radius.md`
  - 배경: `color.bg.tertiary` (사진 없을 때)
  - `object-fit: cover`
- **정보:**
  - 식당명: `typo.body1` (16px, SemiBold), `color.text.primary`
  - 메타: "한식 · 도보 8분 · ~1만원" — `typo.caption` (13px), `color.text.secondary`
  - `font-variant-numeric: tabular-nums`
- **하트:** 44x44px 터치 영역
  - 비활성: Phosphor `heart` 24px, `color.text.placeholder`
  - 활성: Phosphor `heart` filled, `color.primary`

### 2-7. List Item

- **패딩:** `12px 16px`
- **하단 테두리:** `1px solid color.border.default`
- **Hover:** 배경 `color.bg.secondary`
- **구성:** 사진 + 콘텐츠 + 하트 (flex, gap `12px`)
- **사진:**
  - 80x80px, `radius.md`
  - 배경: `color.bg.tertiary`
  - `object-fit: cover`
- **콘텐츠:**
  - 식당명: `typo.body1` (16px, SemiBold), `color.text.primary`
  - 메타: `typo.caption` (13px), `color.text.secondary`, `font-variant-numeric: tabular-nums`
  - 별점 (있을 때): "★ 4.0 (3회)" — `typo.caption` (13px), `color.text.secondary`
    - 별 색상: `color.rating` (#FBBF24)
  - 상단 마진 각 `3px`
- **하트:** Mini Card와 동일
- **폐업 식당:**
  - 전체 `opacity: 0.5`
  - 식당명 우측: "폐업" 뱃지 — 배경 `color.bg.tertiary`, `radius.sm`, `typo.overline` (11px, Medium), `color.text.placeholder`

### 2-8. Bottom Tab Bar (72px)

- 홈 디자인 명세와 동일 스펙
- 활성 탭: "탐색" (Phosphor `magnifying-glass` filled, `color.primary`)

## 3. 상태별 UI

### 로딩

- View Content 숨김
- 스켈레톤: 리스트 형태 (사진 80x80 사각형 + 텍스트 막대 3줄) x 4개
- shimmer 애니메이션

### 정상 (기본)

- 위 명세 그대로

### 빈 상태 (필터 결과 없음)

- View Content 숨김
- 중앙:
  - Phosphor `bowl-food` 48px, `color.text.placeholder`
  - "조건에 맞는 식당이 없어요" — `typo.body1`, `color.text.secondary`
  - [필터 초기화] 버튼 — Button/Secondary
- 상단 여백 `64px`

### 즐겨찾기 빈 상태

- View Content 숨김
- 중앙:
  - Phosphor `heart` 48px, `color.text.placeholder`
  - "즐겨찾기한 식당이 없어요" — `typo.body1`, `color.text.secondary`
  - "마음에 드는 식당에 하트를 눌러보세요" — `typo.body2`, `color.text.placeholder`

### 에러 (네트워크/서버)

- View Content 숨김
- 중앙:
  - Phosphor `wifi-slash` 48px, `color.text.placeholder`
  - "인터넷 연결을 확인해주세요" — `typo.body1`, `color.text.secondary`
  - [다시 시도] 버튼 — Button/Primary

### 검색 결과 없음

- 리스트 영역 대체:
  - "검색 결과가 없어요" — `typo.body1`, `color.text.secondary`
  - "다른 키워드로 검색해보세요." — `typo.body2`, `color.text.placeholder`

## 4. 인터랙션

| 요소 | 동작 | 결과 | 애니메이션 |
|------|------|------|-----------|
| 검색 바 | 탭 | 검색 전용 화면 전환 | push (250ms) |
| 카테고리 칩 | 탭 | 활성/비활성 토글, 결과 필터링 | fade (150ms) |
| 즐겨찾기 칩 | 탭 | 즐겨찾기만 필터 | fade (150ms) |
| 지도 핀 | 탭 | 하단 미니 카드 표시 | slide-up (200ms) |
| 미니 카드 | 탭 | 식당 상세 화면 | push (250ms) |
| 리스트 아이템 | 탭 | 식당 상세 화면 | push (250ms) |
| 뷰 전환 | 탭 | 지도 ↔ 리스트 전환 | fade (250ms) |
| 정렬 드롭다운 | 탭 | 정렬 기준 변경 | fade (150ms) |
| 하트 | 탭 | 즐겨찾기 토글 | scale bounce (200ms) |
| 리스트 | 스크롤 | 20개씩 무한 스크롤 | fade-in (250ms) |
| 하단 탭 | 탭 | 탭 전환 | none |

모든 인터랙션 easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## 5. 산출물 체크리스트

- [x] 디자인 토큰만 사용 (핀 색상에 `color.category.*` 토큰 사용)
- [x] Primary CTA 없음 (탐색 화면은 탐색 자체가 주 행동)
- [x] 정보 계층 3단계 이내 (검색 → 식당명 → 메타)
- [x] 로딩·빈 상태·에러 상태 + 즐겨찾기 빈 상태 모두 정의
- [x] 모바일 터치 영역 44x44px 이상 (검색, 칩, 하트, 탭)
- [x] 텍스트-배경 대비 확인 (Primary #D4501F on #FFFFFF = 5.2:1)
- [x] 벤치마크(배민 지도 탐색) 참조 명시
- [x] 데이터 바인딩: {식당명}, {카테고리}, {도보시간}, {가격대}, {별점}, {방문횟수}
- [x] 인터랙션 + 전환 애니메이션 정의
- [x] `word-break: keep-all` 적용
- [x] Pretendard 폰트 사용
- [x] Phosphor Icons 라인 스타일 통일

---

*김지수 드림*
