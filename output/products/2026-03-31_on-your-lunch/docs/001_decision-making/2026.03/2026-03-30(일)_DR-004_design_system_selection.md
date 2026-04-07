---
> 결정일: 2026-03-30
> 결정자: PO + 김지수 (UI 디자이너)
> 관련 회의록: 없음
---

# DR-004. 디자인 시스템 선택

## 결정 사항

온유어런치의 Figma 디자인 시스템을 **5개 레이어 조합 전략**으로 확정한다. 기반 전략은 확정, 브랜드 컬러·폰트는 기획 설계 완료 후 결정.

- **Layer 1 (토큰 기반):** Plus UI v2.0 FREE — 176개 Variables, 3계층 토큰 체계(Primitive > Semantic > Component)
- **Layer 2 (토큰 구조 참조):** Appetite UI 토큰 스타터 3종 — 네이밍 컨벤션 차용
- **Layer 3 (UX 플로우 참조):** Food App UI Kit (Freebie) — 화면 흐름, 정보 구조, 인터랙션 패턴 참조
- **Layer 4 (플랫폼 에셋 참조):** Appetite UI Google Material 3 + iOS 26 Components
- **Layer 5 (시각 톤 참조):** 배달의민족 앱 캡처 + Free Minimal UI Kit

## 선택지와 비교

| 선택지 | 장점 | 단점 |
|--------|------|------|
| **Plus UI 기반 조합 전략 (선택됨)** | 176개 Variables 완비, 3계층 토큰 체계, 무료 | 웹 기반 설계라 모바일 핵심 컴포넌트 직접 제작 필요 |
| Dynamic Layer v5.1 FREE | 인지도 높음 | FREE 버전 편집 가능 컴포넌트 8개뿐, MVP 기반으로 불충분 |
| Untitled UI FREE | 웹 UI 품질 높음 | 웹 중심 설계, FREE 버전 컴포넌트 부족 |
| Simple Design System | 심플한 구조 | Variables/컴포넌트 미퍼블리시, 라이브러리 사용 불가 |

## 배경

### 검토 과정

1. **1차 조사 (도담, 기획자 관점):** 8개 후보 선정. 상세: `.docs/design/figma-design-system-후보목록.md`
2. **2차 검토 (김지수, 디자이너 관점):** 독립 탐색 10개+ 후보. 상세: `.docs/design/design-system-search_jisoo.md`
   - 평가 기준: 모바일 앱 적합성(25%), Variables/토큰 품질(25%), 컴포넌트 품질(20%), 시각적 방향 부합도(15%), 무료 사용 범위(10%), 한글 대응 가능성(5%)

### 탈락 사유

| 후보 | 탈락 사유 |
|------|-----------|
| Dynamic Layer v5.1 FREE | FREE 버전 편집 가능 컴포넌트 8개뿐. MVP 기반으로 불충분 |
| Simple Design System (Community) | Variables/컴포넌트 미퍼블리시, 라이브러리 사용 불가 |
| Untitled UI FREE | 웹 중심 설계, FREE 버전 컴포넌트 부족 |
| gluestack-ui Figma Kit | Auto-Generated 한계, 컴포넌트 23개로 부족 |
| SpeciApp Mobile V1.0 | Variables 지원 불명확 |
| Wise Design System 2025 | 금융 앱 기반, 음식 앱과 컨텍스트 차이 |
| Partikle UI Free | Appetite UI 토큰 스타터가 모바일 맥락에서 더 실용적 |

### 레이어별 상세

**Layer 1. Plus UI v2.0 FREE (토큰 기반)**

| 항목 | 내용 |
|------|------|
| Community URL | https://www.figma.com/community/file/1310670219738074447 |
| PO Duplicate URL | https://www.figma.com/design/pAWJjg2cByDWpHIDNMI4uV |
| 활용 범위 | 176개 Variables (Color 101, Spacing 35, Border 14, Opacity 15, Size 6, Breakpoints 5) |
| 한계 | 웹 기반 설계. Bottom Tab, App Bar 등 모바일 핵심 컴포넌트 부재. 한글 미지원(Inter 폰트) |

Plus UI에서 가져오는 것:
- Color Token 시맨틱 체계, Spacing Scale (4px 기반), Border Radius 체계, Typography Scale
- Button, Input, Checkbox, Radio, Toggle, Badge, Alert, Toast, Modal, Drawer (터치 영역 재조정 후)

김지수가 직접 제작하는 것:
- App Bar, Bottom Tab Navigation (4탭), Restaurant Card, Category Chip, Bottom Sheet, Search Bar, Map View 컴포넌트, Pull-to-Refresh, Skeleton Loading, Rating/Review 카드

**Layer 2. Appetite UI 토큰 스타터 3종 (토큰 구조 참조)**

| 파일 | PO Duplicate URL |
|------|-----------------|
| Color & Dark Mode Token Starter | https://www.figma.com/design/b55XdVe6pXWeJBOohMqoM1 |
| Mobile Spacing System | https://www.figma.com/design/BIdB5xhSLGxDiBhPzPk9kY |
| Mobile Typography System | https://www.figma.com/design/8OH0ABptyAjcD10l6LIveP |

참고: Appetite UI 무료 스타터는 가이드 문서 수준. 완성된 Variable 세트는 유료. 설계 의도와 네이밍 패턴을 참조하는 용도.

**Layer 3. Food App UI Kit (UX 플로우 참조)**

| 항목 | 내용 |
|------|------|
| Community URL | https://www.figma.com/community/file/1017068620457356663 |
| PO Duplicate URL | https://www.figma.com/design/AFBKAtfst08ESLNFgPnBiT |
| 화면 구성 | Splash(3), Sign up/Login(7), Profile/Settings(23), Search(3), Home/Restaurant(9), Order/Delivery(10), Support(9) |
| 주의 | 상당수 화면이 유료 잠금 상태. 컴포넌트 직접 사용 불가(Auto Layout 미적용, Variable 없음) |

참고할 UX 패턴: Home(위치 표시 + 카테고리 배너 + 레스토랑 리스트), Search(카테고리 Chip 그리드 + 최근 검색), Bottom Tab(Home / Search / Bookmark / Profile 4탭)

**Layer 4. 플랫폼 에셋 참조 — Appetite UI**

| 파일 | PO Duplicate URL | 용도 |
|------|-----------------|------|
| Google Material 3 Platform Assets | https://www.figma.com/design/Pj4bMMNRe7n5pgFbEv6A8I | Android 네이티브 컴포넌트 참조 |
| iOS 26 Components | https://www.figma.com/design/Lwyw7tQEyrH7VRC6FrvHpE | iOS 네이티브 컴포넌트 참조 |

**Layer 5. 시각 톤 참조**
- 배달의민족 앱 직접 캡처
- Free Minimal UI Kit (https://www.figma.com/community/file/1278025551174832225) — 배민 스타일과 가장 근접한 톤

## 영향

### 미결정 사항 (기획 설계 완료 후 결정)

| # | 사항 | 김지수 권장 | 상태 |
|---|------|-----------|------|
| 1 | Primary Color | A. Warm Orange `#FF6B35` | PO 결정 대기 |
| 2 | 폰트 | Pretendard (무료, 한글 최적화, Inter 메트릭 호환) | PO 결정 대기 |
| 3 | Dark 모드 | MVP 미지원 (토큰 구조만 잡아두고 나중에 대응) | PO 결정 대기 |

Primary Color 후보:

| 후보 | HEX | 특징 |
|------|-----|------|
| **A (권장)** | `#FF6B35` Warm Orange | 식욕 자극, 음식 앱 검증 색상, 에너지/활력 |
| B | `#FF8A80` Soft Coral | 부드럽고 친근, 라이프스타일 느낌 |
| C | `#F2A900` Mustard Yellow | 따뜻하고 캐주얼, 카카오 계열과 유사 주의 |

공통 컬러 토큰 (Primary 무관):

```
Surface:        #FFFFFF
Background:     #F9FAFB  (gray-50)
Text Primary:   #111827  (gray-900)
Text Secondary: #6B7280  (gray-500)
Border:         #E5E7EB  (gray-200)
Success:        #15803D
Warning:        #A16207
Danger:         #B91C1C
```

### 디자인 작업 계획 (기획 설계 완료 후 착수)

| Phase | 작업 | 예상 기간 | 선행 조건 |
|-------|------|-----------|-----------|
| 1 | 토큰 커스터마이징 (컬러 교체, Pretendard 적용, 웹 전용 Variable 정리) | 1일 | PO 컬러/폰트 결정 |
| 2 | 모바일 핵심 컴포넌트 6종 제작 (App Bar, Bottom Tab, Restaurant Card, Category Chip, Bottom Sheet, Search Bar) | 2~3일 | Phase 1 완료 |
| 3 | 주요 화면 설계 (Home, Search, Restaurant Detail, Map View, Profile, Onboarding) | 3~5일 | 기능 명세서 완료 |
| 4 | 개발팀 전달 산출물 (토큰 JSON, 컴포넌트 가이드, 화면 스펙, 프로토타입) | 2~3일 | Phase 3 완료 |

### 프로세스 교훈

- 디자인 관련 의사결정은 반드시 디자이너(김지수)가 참여해야 한다.
- 도담(기획 총괄)의 역할은 요구사항 정리 → 위임 → 조율이지, 디자인 판단을 대신하는 것이 아니다.
- 1차 조사(도담)에서 Dynamic Layer "유료 제외", Food App UI Kit "64개 화면" 등 부정확한 정보가 있었으나, 2차 검토(김지수)에서 정정됨.

### 관련 문서

| 문서 | 위치 | 내용 |
|------|------|------|
| 후보 목록 (도담 1차) | `.docs/design/figma-design-system-후보목록.md` | 8개 후보 기획자 관점 조사 |
| 인수인계 브리핑 | `.docs/design/handover_design-system-review.md` | 도담 → 김지수 인수인계 |
| 디자이너 1차 검토 | `.docs/design/design-system-review_jisoo.md` | Plus UI 상세 검토 + 브랜드 방향 제안 |
| 디자이너 독립 탐색 | `.docs/design/design-system-search_jisoo.md` | 10개+ 후보 디자이너 관점 평가 |
| Appetite UI 분석 | `.docs/design/appetite-ui-analysis_jisoo.md` | 토큰 스타터 실제 내용 분석 |
| 액션 플랜 | `.docs/design/design-system-action-plan_jisoo.md` | 작업 계획 상세 |
