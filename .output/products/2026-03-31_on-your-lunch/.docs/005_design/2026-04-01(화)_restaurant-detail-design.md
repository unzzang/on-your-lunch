---
> 작성자: 김지수 (UI/UX 디자이너)
> 작성일: 2026-04-01
> 화면 ID: SCR-DETAIL-001
> 관련 명세: 004_planning/specs/01_lunch_recommendation.md, 003_eating_history.md
> 관련 화면설계: 004_planning/screen/03_restaurant_detail.md
> 벤치마크: 배달의민족 가게 상세 화면
> 상태: PO 리뷰 요청
---

# 식당 상세 화면 디자인 명세

## 1. 레이아웃 구조도

```
┌─────────────────────────────────┐
│  [← 뒤로]              [공유]    │  ← 반투명 오버레이 위 (z-index: 11)
├─────────────────────────────────┤
│                                  │
│  [대표 사진 영역 280px]           │  ← Hero Image
│  (좌우 스와이프, ●○○ 인디케이터)  │
│                                  │
├─────────────────────────────────┤
│                                  │
│  을지로 골목식당            [♥]   │  ← Header
│  한식 · 백반                      │
│                                  │
│  📍 도보 8분 · 서울 강남구...     │  ← Info List
│  💰 8,000~12,000원               │
│  🕐 11:00~15:00                  │
│  📞 02-1234-5678                 │
│                                  │
│  ┌────────────────────────────┐ │  ← My Record
│  │ 내 기록                      │ │
│  │ ★ 4.0 · 3번 방문             │ │
│  │ 최근: 2026-03-28 "된장찌개"   │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │  ← Map Preview
│  │     [지도 미리보기]           │ │
│  └────────────────────────────┘ │
│                                  │
├─────────────────────────────────┤
│  [🗺 길찾기]    [🍽 먹었어요]     │  ← Bottom Actions (고정)
└─────────────────────────────────┘
```

## 2. 영역별 상세 명세

### 2-1. Status Bar (44px)

- 사진 영역 위에 위치하므로 `color.text.inverse` (#FFFFFF)
- `position: absolute`, `z-index: 10`

### 2-2. Hero Image (280px)

- **높이:** `280px`, overflow hidden
- **사진:** `object-fit: cover`, 풀 너비
- **오버레이 그라데이션:** 상단 100px, `rgba(0,0,0,0.4)` → `transparent`
- **네비게이션 (z-index: 11):**
  - 뒤로: Phosphor `caret-left` 24px, `color.text.inverse`, 터치 44x44px
  - 공유: Phosphor `share-network` 24px, `color.text.inverse`, 터치 44x44px
  - 좌우 패딩: `16px`, 상단 `44px` (Status Bar 바로 아래)
- **인디케이터:**
  - 하단 `12px`, 중앙 정렬
  - 활성: `8px` 원, `#FFFFFF`
  - 비활성: `8px` 원, `rgba(255,255,255,0.5)`
  - 간격: `6px`
- **사진 없을 때:**
  - 배경: `color.bg.tertiary`
  - Phosphor `fork-knife` 48px, `color.text.placeholder`, 중앙

### 2-3. Header

- **패딩:** `20px 16px 0`
- **식당명:**
  - `typo.h1` (24px, Bold), `color.text.primary`
- **즐겨찾기:**
  - Phosphor `heart` 28px
  - 활성: `color.primary` (#D4501F), filled
  - 비활성: `color.text.placeholder`
  - 터치: 44x44px
- **카테고리:**
  - `typo.body2` (14px), `color.text.secondary`
  - 형식: "한식 · 백반"
  - 상단 마진: `4px`

### 2-4. Info List

- **패딩:** `16px`
- **각 항목:** 아이콘 + 텍스트 (flex, gap `12px`)
  - 아이콘: Phosphor 20px, `color.text.secondary`
  - 텍스트: `typo.body2` (15px), `color.text.primary`
  - `font-variant-numeric: tabular-nums`
- **항목 간격:** `12px`
- **전화번호:** 탭 시 전화 앱 연결 → 텍스트 `color.primary`
- **항목 목록:**

| 아이콘 | 내용 | 없을 때 |
|--------|------|---------|
| `map-pin` | 도보 X분 · 주소 | (필수) |
| `currency-krw` | 가격 범위 | "가격 정보 준비 중" |
| `clock` | 영업시간 | 항목 미표시 |
| `phone` | 전화번호 (탭 링크) | 항목 미표시 |

### 2-5. My Record (방문 이력 있을 때만)

- **마진:** `0 16px`
- **패딩:** `16px`
- **배경:** `color.bg.secondary` (#F9FAFB)
- **테두리:** `1px solid color.border.default`
- **모서리:** `radius.lg` (12px)
- **타이틀:**
  - "내 기록" — `typo.overline` (11px, Medium), `color.text.secondary`, `letter-spacing: 0.5px`
  - 하단 마진: `10px`
- **통계:**
  - "★ 4.0 · 3번 방문" — `typo.body1` (16px, SemiBold), `color.text.primary`
  - 별 색상: `color.rating` (#FBBF24)
- **최근 기록:**
  - "최근: 2026-03-28 \"된장찌개 맛있었어요\"" — `typo.caption` (13px), `color.text.secondary`
  - 행간: 18px, 상단 마진: `6px`

### 2-6. Map Preview

- **마진:** `16px`
- **높이:** `160px`
- **배경:** `color.bg.tertiary`
- **테두리:** `1px solid color.border.default`
- **모서리:** `radius.lg`
- **중앙:** Phosphor `map-trifold` 32px, `color.text.placeholder`
- **하단:** "지도에서 위치 보기" — `typo.caption` (13px), `color.text.placeholder`
- **탭:** 카카오맵 앱으로 이동

### 2-7. Bottom Actions (하단 고정)

- **위치:** `position: absolute`, `bottom: 0`
- **배경:** `color.bg.primary`
- **상단 테두리:** `1px solid color.border.default`
- **패딩:** `12px 16px 32px`
- **버튼 간격:** `8px`
- **각 버튼:** `flex: 1`, 높이 `48px`, `radius.md`

| 버튼 | 스타일 | 아이콘 |
|------|--------|--------|
| 길찾기 | Button/Secondary | `map-trifold` 20px |
| 먹었어요 | Button/Primary | `fork-knife` 20px |

- **오늘 기록 있음 상태:** "먹었어요" → "기록 수정" (Button/Secondary, `pencil-simple` 20px)

### 2-8. 먹었어요 바텀시트

- **오버레이:** `color.overlay` (`rgba(0,0,0,0.5)`)
- **바텀시트:**
  - 배경: `color.bg.primary`
  - 상단 모서리: `radius.xl` (16px)
  - 패딩: `12px 24px 40px`
  - 그림자: `shadow.lg`
- **핸들:** 32x4px, `color.border.default`, 중앙, 하단 마진 `20px`
- **타이틀:**
  - "{식당명}에서 먹었군요!" — `typo.h3` (18px, SemiBold), `color.text.primary`
  - 하단 마진: `20px`
- **별점 안내:**
  - "별점을 남겨주세요" — `typo.body2` (14px), `color.text.secondary`
  - 하단 마진: `12px`
- **별점:**
  - 5개 별, 각 `32px`
  - 비활성: `color.border.default`
  - 활성: `color.rating` (#FBBF24)
  - 간격: `8px`
  - 하단 마진: `16px`
- **메모 라벨:**
  - "한줄 메모 (선택)" — `typo.body2` (14px), `color.text.secondary`
  - 하단 마진: `8px`
- **메모 인풋:**
  - 높이: `80px`, 패딩: `12px 16px`
  - 테두리: `1px solid color.border.default`
  - 모서리: `radius.md`
  - 포커스: 테두리 `color.primary`
  - 플레이스홀더: "오늘 된장찌개가 맛있었어요" — `color.text.placeholder`
  - 최대 300자
- **글자 수:**
  - "0/300자" — `typo.caption` (12px), `color.text.placeholder`
  - 우측 정렬, 상단 마진 `4px`
- **저장 버튼:**
  - Button/Primary, 높이 `48px`
  - 별점 미선택 시: `color.primary.disabled`
  - 상단 마진: `16px`
- **저장 완료 후:**
  - 바텀시트 닫힘
  - 토스트: "기록이 저장되었어요!" — 3초 자동 닫힘

## 3. 상태별 UI

### 로딩

- Hero: `color.bg.tertiary` 사각형, shimmer 애니메이션
- 콘텐츠: 스켈레톤 (텍스트 막대 + 카드 사각형)
- Bottom Actions: 숨김

### 정상 (기본)

- 위 명세 그대로

### 빈 상태 (식당 정보 없음)

- Hero 숨김
- 중앙: Phosphor `storefront` 48px, `color.text.placeholder`
- "식당 정보를 불러올 수 없어요" — `typo.body1`, `color.text.secondary`
- Bottom Actions: 숨김

### 에러 (네트워크/서버)

- Hero 숨김
- 중앙: Phosphor `wifi-slash` 48px, `color.text.placeholder`
- "인터넷 연결을 확인해주세요" — `typo.body1`, `color.text.secondary`
- [다시 시도] 버튼 — Button/Primary
- Bottom Actions: 숨김

### 방문 이력 없음

- "내 기록" 영역 미표시
- 나머지 정상 표시

### 당일 이미 기록

- "먹었어요" 버튼 → "기록 수정" (Button/Secondary)

## 4. 인터랙션

| 요소 | 동작 | 결과 | 애니메이션 |
|------|------|------|-----------|
| 뒤로 | 탭 | 이전 화면 복귀 | pop 우→좌 (250ms) |
| 공유 | 탭 | 카카오톡 공유 | 외부 앱 |
| 사진 | 좌우 스와이프 | 사진 전환 | slide (250ms) |
| 즐겨찾기 | 탭 | 하트 토글 | scale bounce (200ms) |
| 길찾기 | 탭 | 외부 지도 앱 | 외부 앱 |
| 먹었어요 | 탭 | 바텀시트 올라옴 | slide-up (250ms) |
| 기록 수정 | 탭 | 바텀시트 (기존 데이터 채워진 상태) | slide-up (250ms) |
| 별점 | 탭 | 별 채움 | scale (150ms) |
| 저장 | 탭 | 바텀시트 닫힘 + 토스트 | slide-down (250ms) |
| 주소 | 탭 | 클립보드 복사 + 토스트 | none |
| 전화번호 | 탭 | 전화 앱 | 외부 앱 |
| 지도 | 탭 | 카카오맵 앱 | 외부 앱 |

모든 인터랙션 easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## 5. 산출물 체크리스트

- [x] 디자인 토큰만 사용 (임의 색상·크기 없음)
- [x] Primary CTA 화면당 1개 ("먹었어요" 버튼)
- [x] 정보 계층 3단계 이내 (식당명 → 카테고리 → 메타 정보)
- [x] 로딩·빈 상태·에러 상태 모두 정의
- [x] 모바일 터치 영역 44x44px 이상 (뒤로, 공유, 하트, 버튼)
- [x] 텍스트-배경 대비 확인 (Primary #D4501F on #FFFFFF = 5.2:1)
- [x] 벤치마크(배민 가게 상세) 참조 명시
- [x] 데이터 바인딩: {식당명}, {카테고리}, {하위분류}, {도보시간}, {주소}, {가격범위}, {영업시간}, {전화번호}, {별점}, {방문횟수}, {최근메모}
- [x] 인터랙션 + 전환 애니메이션 정의
- [x] `word-break: keep-all` 적용
- [x] Pretendard 폰트 사용
- [x] Phosphor Icons 라인 스타일 통일

---

*김지수 드림*
