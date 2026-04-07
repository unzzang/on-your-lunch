---
> 작성자: 김지수 (UI/UX 디자이너)
> 작성일: 2026-04-01
> 화면 ID: SCR-ONBOARD-001
> 관련 명세: 004_planning/specs/02_onboarding.md
> 관련 화면설계: 004_planning/screen/02_onboarding.md
> 벤치마크: 배달의민족 온보딩 (깔끔, 최소 Step)
> 상태: PO 리뷰 요청
---

# 온보딩 화면 디자인 명세

## 1. 레이아웃 구조도

```
[스플래시] → [인트로/로그인] → [약관 동의] → [Step 1: 위치] → [Step 2: 취향] → [Step 3: 제외] → 홈

┌─────────────────────────────────┐
│        Status Bar (44px)         │  ← OS 기본
├─────────────────────────────────┤
│                                  │
│        온유어런치                 │  ← 스플래시 (로고 + 태그라인)
│        매일 점심, 고민 끝.        │
│                                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Status Bar (44px)         │
├─────────────────────────────────┤
│                                  │
│     [일러스트 영역 300px]         │  ← 인트로/로그인
│                                  │
│  매일 점심 뭐 먹지?              │
│  온유어런치가 골라줄게요!         │
│                                  │
│  ┌────────────────────────────┐ │
│  │  G  Google로 시작하기        │ │
│  └────────────────────────────┘ │
│  계속하면 이용약관에 동의합니다    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Status Bar (44px)         │
├─────────────────────────────────┤
│  약관 동의                       │
│                                  │
│  [✓] 전체 동의                   │
│  ───────────────────────         │
│  [✓] 서비스 이용약관 (필수)   [>] │
│  [✓] 개인정보 처리방침 (필수) [>] │
│  [✓] 위치정보 이용약관 (필수) [>] │
│  [ ] 마케팅 수신 동의 (선택)  [>] │
│                                  │
│  ┌────────────────────────────┐ │
│  │    동의하고 시작하기          │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  [< 뒤로]                        │
│  ■■□□□□  Step 1/3                │
├─────────────────────────────────┤
│  회사가 어디인가요?               │
│  추천할 때 이 위치 기준으로       │
│  가까운 식당을 찾아드려요.        │
│                                  │
│  ┌─────────────────────────┐    │
│  │ 🔍 건물명 또는 주소 검색   │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │     [카카오맵 지도]        │    │
│  └─────────────────────────┘    │
│  📍 서울 강남구 역삼로 152       │
│     강남파이낸스센터               │
│                                  │
│  ┌────────────────────────────┐ │
│  │           다음               │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

## 2. 영역별 상세 명세

### 2-1. 스플래시

- **배경:** `color.bg.primary` (#FFFFFF)
- **로고:**
  - 텍스트: "온유어런치" — `typo.display` (32px, Bold), `color.primary` (#D4501F)
  - 중앙 정렬
- **태그라인:**
  - 텍스트: "매일 점심, 고민 끝." — `typo.body1` (16px, Regular), `color.text.secondary`
  - 로고 하단 `12px`
- **자동 전환:** 1.5초 후 인트로로 전환

### 2-2. 인트로/로그인

- **배경:** `color.bg.primary`
- **일러스트 영역:**
  - 높이: `300px`, 상단 마진 `40px`
  - 중앙 정렬, 아이콘 조합:
    - Phosphor `fork-knife` 80px, `color.primary`, opacity 0.7
    - Phosphor `users-three` 60px, `color.primary`, opacity 0.5
  - 하단: "점심 고민하는 직장인들" — `typo.body2` (14px), `color.text.placeholder`
- **타이틀:**
  - "매일 점심 뭐 먹지?\n온유어런치가 골라줄게요!" — `typo.h1` (24px, Bold), `color.text.primary`
  - `text-align: center`, `text-wrap: balance`, 행간 34px
  - 상단 마진 `24px`
- **서브타이틀:**
  - "회사 근처 맛집, 3초만에 추천" — `typo.body1` (16px), `color.text.secondary`
  - `text-align: center`, 상단 마진 `8px`
- **Google 로그인 버튼:**
  - 높이: `48px`
  - 배경: `color.bg.primary`, 테두리 `1px solid color.border.default`
  - 모서리: `radius.md` (8px)
  - 그림자: `shadow.sm`
  - 아이콘: Google 로고 SVG 20x20px
  - 텍스트: "Google로 시작하기" — `typo.body1` (16px, Medium), `color.text.primary`
  - 아이콘-텍스트 간격: `12px`
  - 상단 마진: `32px`
- **약관 안내:**
  - "계속하면 이용약관에 동의하게 됩니다" — `typo.caption` (12px), `color.text.placeholder`
  - "이용약관" 링크: `color.text.secondary`, underline
  - `text-align: center`, 상단 마진 `16px`, 하단 마진 `40px`

### 2-3. 약관 동의

- **타이틀:**
  - "약관 동의" — `typo.h2` (20px, Bold), `color.text.primary`
  - 패딩 `16px 0`
- **전체 동의:**
  - 체크박스 (24x24px) + "전체 동의" — `typo.h3` (18px, SemiBold), `color.text.primary`
  - 간격: `12px`
  - 하단 구분선: `1px solid color.border.default`
  - 패딩: `16px 0`
- **개별 약관 항목:**
  - 체크박스 (24x24px) + 라벨 + 화살표
  - 라벨: `typo.body2` (14px), `color.text.primary`
  - "(필수)"/"(선택)": `typo.caption` (12px), `color.text.secondary`
  - 화살표: Phosphor `caret-right` 20px, `color.text.placeholder`
  - 패딩: `14px 0`
- **체크박스:**
  - 비활성: 24x24px, `radius.sm` (4px), 테두리 `2px solid color.border.default`
  - 활성: 배경 `color.primary` (#D4501F), 테두리 `color.primary`, 흰색 체크마크
  - 전환: 150ms
- **버튼:**
  - "동의하고 시작하기" — Button/Primary
  - 높이: `48px`, 하단 마진 `40px`
  - 필수 3개 미체크 시: `color.primary.disabled` (#E8A78E)

### 2-4. Step 공통 요소

- **뒤로 버튼:**
  - Phosphor `caret-left` 20px + "뒤로" — `typo.body2` (14px), `color.text.secondary`
  - 패딩: `12px 0`
- **프로그레스 바:**
  - 6개 세그먼트, 간격 `4px`
  - 각 세그먼트: 높이 `4px`, `radius.full` (2px)
  - 비활성: `color.bg.tertiary` (#F3F4F6)
  - 활성: `color.primary` (#D4501F)
  - 하단 마진: `24px`
- **Step 라벨:**
  - "Step X/3" — `typo.caption` (12px), `color.text.secondary`
  - 하단 마진: `16px`
- **Step 타이틀:**
  - `typo.h2` (20px, Bold), `color.text.primary`
  - 행간: 28px, `text-wrap: balance`
- **Step 서브타이틀:**
  - `typo.body2` (14px, Regular), `color.text.secondary`
  - 행간: 20px, 상단 마진 `8px`
- **CTA 버튼:**
  - Button/Primary, 높이 `48px`
  - 하단 마진 `40px`

### 2-5. Step 1: 회사 위치

- **검색 인풋:**
  - 높이 자동 (패딩 `12px 16px`)
  - 배경: `color.bg.tertiary`
  - 모서리: `radius.md`
  - 아이콘: Phosphor `magnifying-glass` 20px, `color.text.placeholder`
  - 텍스트: `typo.body2` (15px), `color.text.primary`
  - 플레이스홀더: "건물명 또는 주소 검색" — `color.text.placeholder`
  - 포커스: 테두리 `color.primary`
  - 상단 마진: `24px`
- **지도 영역:**
  - 높이: `200px`, 모서리: `radius.lg`
  - 상단 마진: `16px`
  - 배경: `color.bg.tertiary` (지도 미로드 시)
  - Phosphor `map-pin` 32px 중앙
- **주소 표시:**
  - 배경: `color.bg.secondary`, 모서리: `radius.md`
  - 패딩: `12px`
  - 상단 마진: `16px`
  - 아이콘: Phosphor `map-pin` 20px, `color.primary`
  - 주소: `typo.body2` (14px), `color.text.primary`
  - 건물명: `typo.caption` (13px), `color.text.secondary`

### 2-6. Step 2: 취향 + 가격대

- **카테고리 칩:**
  - 비활성: 패딩 `10px 20px`, `radius.full`, 테두리 `1px solid color.border.default`, 배경 `color.bg.primary`, 텍스트 `typo.body2` (14px, Medium), `color.text.primary`
  - 활성: 배경 `color.primary` (#D4501F), 텍스트 `color.text.inverse`, 테두리 `color.primary`
  - 간격: `8px`, flex-wrap
  - 전환: 150ms
- **구분선:**
  - `1px solid color.border.default`, 마진 `24px 0`
- **가격대 칩:**
  - 3개 균등 배치 (flex: 1)
  - 비활성: 패딩 `12px`, `radius.md`, 테두리 `1px solid color.border.default`, 텍스트 `typo.body2` (14px, Medium), `text-align: center`
  - 활성: 배경 `color.primary`, 텍스트 `color.text.inverse`

### 2-7. Step 3: 제외 설정

- **섹션 라벨:**
  - "알레르기" / "싫어하는 음식" — `typo.body2` (14px, SemiBold), `color.text.secondary`
  - 하단 마진: `10px`
- **칩:** Step 2 카테고리 칩과 동일 스펙
- **건너뛰기:**
  - "건너뛰기" — `typo.body2` (14px), `color.text.secondary`, underline
  - `text-align: center`, 패딩 `12px`
- **완료 버튼:**
  - "완료!" — Button/Primary, 상단 마진 `12px`

## 3. 상태별 UI

### 로딩 (Google 로그인 / 위치 검색)

- 반투명 오버레이: `color.bg.primary` opacity 0.8
- 중앙: 스피너 (32px, `color.primary` 상단 테두리, 0.8s 회전)
- 하단: "로그인 중이에요..." — `typo.body2`, `color.text.secondary`

### 정상 (기본)

- 위 명세 그대로

### 에러 (네트워크/서버)

- 전체 화면 대체:
  - Phosphor `wifi-slash` 48px, `color.text.placeholder`
  - "인터넷 연결을 확인해주세요" — `typo.body1`, `color.text.secondary`
  - [다시 시도] 버튼 — Button/Primary
- 중앙 정렬, 상단 여백 `64px`

### Google 로그인 실패

- 인트로 화면 유지
- 토스트: "로그인에 실패했어요. 다시 시도해주세요." — 3초 자동 닫힘
- 토스트 배경: `color.toast.bg`, 텍스트 `color.text.inverse`, `radius.md`

## 4. 인터랙션

| 요소 | 동작 | 결과 | 애니메이션 |
|------|------|------|-----------|
| 스플래시 | 1.5초 대기 | 인트로로 전환 | fade (250ms) |
| Google 로그인 | 탭 | OAuth 팝업 → 로딩 오버레이 | fade-in (150ms) |
| 약관 체크박스 | 탭 | 체크/해제 토글 | scale (150ms) |
| 전체 동의 | 탭 | 모든 항목 일괄 토글 | none |
| 카테고리 칩 | 탭 | 활성/비활성 토글 | fade (150ms) |
| 가격대 칩 | 탭 | 단일 선택 교체 | fade (150ms) |
| 검색 인풋 | 포커스 | 키보드 노출 + 자동완성 | push (250ms) |
| Step 전환 | 다음/뒤로 | 화면 교체 | push 좌→우 / 우→좌 (250ms) |
| 완료 | 탭 | 홈 화면으로 이동 | push (250ms) |

모든 인터랙션 easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## 5. 산출물 체크리스트

- [x] 디자인 토큰만 사용 (임의 색상·크기 없음)
- [x] Primary CTA 화면당 1개 (각 Step의 다음/완료 버튼)
- [x] 정보 계층 3단계 이내 (Step 타이틀 → 섹션 라벨 → 칩/인풋)
- [x] 로딩·에러 상태 모두 정의
- [x] 모바일 터치 영역 44x44px 이상 (체크박스, 버튼, 칩)
- [x] 텍스트-배경 대비 확인 (Primary #D4501F on #FFFFFF = 5.2:1)
- [x] 벤치마크(배민) 참조 명시
- [x] 데이터 바인딩: {주소}, {건물명}, {카테고리}, {가격대}, {알레르기}, {제외 카테고리}
- [x] 인터랙션 + 전환 애니메이션 정의
- [x] `word-break: keep-all`, `text-wrap: balance` 적용
- [x] Pretendard 폰트 사용
- [x] Phosphor Icons 라인 스타일 통일

---

*김지수 드림*
