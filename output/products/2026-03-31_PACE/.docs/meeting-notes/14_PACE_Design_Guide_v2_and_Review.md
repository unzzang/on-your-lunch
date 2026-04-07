# PACE 디자인 가이드 v2.0 확정 및 화면 반영

> 일시: 2026-03-17
> 참석: PO(사용자), 위더(AI 시니어 기획자), 김지수(Sub Agent — UI/UX 디자인)

## 논의 배경

8개 화면 디자인 완성 후, PO 디자인 리뷰 과정에서 "Spotify와 너무 비슷하다"는 피드백 발생. 컬러 아이덴티티 전면 재설계 및 역할 분리 원칙 재확인.

---

## 핵심 결정 사항

### 1. 역할 분리 원칙 재확인

**PO 피드백:** "디자인 담당자가 해야지, 왜 기획자가 디자인 작업을 합니까?"

- 기존: 위더가 일부 디자인 작업(컬러 팔레트, 변수 설정, 색상 교체)을 직접 수행
- **확정:** 모든 실무 작업은 담당 에이전트가 직접 수행. 위더는 요구사항 정리 + 전달 + 결과 확인만.
  - 디자인 → 지수님
  - 프론트엔드 → 잭, 톰 하디
  - 백엔드 → 인수님, 명환님
  - QA → 도준님
  - 데이터 → 톰 크루즈님

### 2. 컬러 팔레트 3안 검토 → A안(Blue) 확정

지수님이 3가지 컬러 팔레트 안을 제작:

| 안 | 액센트 | 키워드 |
|---|---|---|
| A — Blue | #4A90D9 | 집중 · 신뢰 · 차분 |
| B — Purple | #7C5CFC | 프리미엄 · 지적 · 몰입 |
| C — Teal | #00BFA5 | 활력 · 성장 · 균형 |

**PO 선택: A안(Blue)** — "깔끔해보인다"

### 3. 디자인 가이드 v2.0 전면 재작성

PO 피드백: "거의 복사&붙여넣기 수준. 우리만의 아이덴티티가 필요하다."

지수님이 디자인 가이드를 처음부터 새로 작성. 벤치마크: Linear, Arc Browser, Duolingo, Notion.

#### 최종 확정 컬러 시스템

| 카테고리 | 토큰 | 값 | 비고 |
|---|---|---|---|
| 배경 | bg-primary | **#121212** | PO 최종 결정 |
| 배경 | bg-elevated | #1A1A1A | 카드, 미니플레이어 |
| 배경 | bg-surface | #242424 | 입력 필드, 내부 영역 |
| 배경 | bg-surface-hover | #2E2E2E | 호버/프레스 |
| 액센트 | accent | **#4A90D9** | 메인 블루 |
| 액센트 | accent-light | #7CB3EE | 호버/강조 |
| 액센트 | accent-dark | #3571B5 | 프레스 |
| 시맨틱 | success | **#2DD4BF (틸)** | Spotify 그린 완전 탈피 |
| 시맨틱 | warning | #F5A623 | 앰버 |
| 시맨틱 | error | #EF6461 | 코럴 |
| 텍스트 | text-primary | #F0F2F5 | 약간 따뜻한 화이트 |
| 텍스트 | text-secondary | #8B90A0 | 보조 텍스트 |
| 텍스트 | text-muted | #6A6A6A | 비활성 |
| 보더 | border-subtle | #202020 | 미세 구분 |
| 보더 | border-default | #333333 | 기본 보더 |

#### 타이포그래피
- **DM Sans** — 제목, 본문, 라벨 (전체)
- **Inter** — 숫자/타이머 전용 (Now Playing 37:24, MyPage 142h/12일/68%, D-247 등)

#### 신규 컴포넌트 (13종)
Button(Primary/Secondary/Outline/Destructive), Input/Default, MiniPlayer, BottomNav, Chip(Active/Inactive), Badge(Success/Warning/Error), RoutineCard

### 4. 배경색 변경 이력

| 순서 | 배경 | PO 피드백 | 결과 |
|---|---|---|---|
| v1 | #121212 (Spotify) | "Spotify와 너무 똑같다" | 변경 |
| v2-1 | #0C1021 (딥 네이비) | "파랗게 보인다" | 변경 |
| v2-2 | #0A0A0A (거의 블랙) | PO가 #121212 요청 | 변경 |
| **v2-3 (최종)** | **#121212** | 확정 | ✅ |

### 5. 하단 네비 활성 탭 통일

- 일부 화면에서 활성 탭이 민트(#2DD4BF) 또는 흰색(#F0F2F5)으로 불일치
- **전체 화면 액센트 블루(#4A90D9)로 통일 완료**

### 6. Home 풀 스크롤 버전 추가

- 기존 `yIuEZ` (375x812) + 신규 `WfW3f` (375x1341, Full Scroll)
- 모든 섹션이 잘리지 않고 한눈에 확인 가능
- "새로 올라온 플레이리스트" 섹션 신규 추가

### 7. Auth 구글 아이콘 수정

- 기존 globe 아이콘 → AI 생성 구글 G 로고 이미지로 교체 (24x24)

---

## 최종 디자인 파일 현황

| 파일 | 내용 | 상태 |
|---|---|---|
| `design-guide.pen` | 디자인 시스템 v2.0 (컬러, 타이포, 컴포넌트 13종) | ✅ |
| `pace-app-home.pen` | Home (기본 + Full Scroll) | ✅ |
| `pace-app-playlist-detail.pen` | 플레이리스트 상세 | ✅ |
| `pace-app-now-playing.pen` | Now Playing (집중 모드) | ✅ |
| `pace-app-search.pen` | Search (카테고리 탐색) | ✅ |
| `pace-app-library.pen` | Library (내 보관함) | ✅ |
| `pace-app-mypage.pen` | MyPage | ✅ |
| `pace-app-onboarding.pen` | Onboarding 3단계 | ✅ |
| `pace-app-auth.pen` | Auth (로그인 + 회원가입) | ✅ |

## PACE 비주얼 아이덴티티 (확정)

- **배경:** #121212 (뉴트럴 블랙)
- **액센트:** #4A90D9 (블루) — 집중, 신뢰
- **성공:** #2DD4BF (틸) — Spotify 그린과 차별화
- **폰트:** DM Sans(본문) + Inter(숫자/타이머)
- **벤치마크:** Spotify(UX 패턴) + Linear/Arc/Notion(비주얼)

---

## Action Items

- [ ] PO: 전체 화면 최종 리뷰 및 추가 피드백
- [ ] PO + 위더: 다음 단계 결정 (기능 명세 보완 or 기술 설계)
- [ ] 위더: 관리자 웹 Feature Map 설계
- [ ] 위더: 오늘 회의 결과 workflow-guide.md 반영
