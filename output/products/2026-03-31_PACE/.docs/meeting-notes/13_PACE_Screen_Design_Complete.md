# PACE 모바일 앱 화면 설계 완료

> 일시: 2026-03-17
> 참석: PO(사용자), 위더(AI 시니어 기획자), 김지수(Sub Agent — UI/UX 디자인)

## 논의 배경

Feature Map 완성(회의록 12번) 후, 화면 설계 먼저 → 기능 명세 동시 보완 방식(B안)으로 진행하기로 결정. 핵심 화면부터 서브 화면까지 전체 8개 화면의 설계서 작성 + 디자인을 병렬로 진행.

---

## 핵심 결정 사항

### 1. 화면 설계 진행 방식 확정

- **B안 채택:** 화면 설계 먼저 → 기능 명세 동시 보완
- **설계서:** `planning/screen/` 폴더에 화면별 개별 파일 (01~08)
- **디자인 파일:** `design/pace-app-{화면명}.pen` (네이밍 규칙 DR-007 준수)
- **파일 생성 프로세스:** PO가 빈 .pen 파일 먼저 생성 → 지수님이 해당 파일에서 작업 → PO가 Cmd+S로 저장

### 2. 전체 8개 화면 설계 + 디자인 완료

| # | 화면 | 설계서 | 디자인 파일 |
|---|---|---|---|
| 01 | Home | `planning/screen/01_home.md` | `design/pace-app-home.pen` |
| 02 | 플레이리스트 상세 | `planning/screen/02_playlist-detail.md` | `design/pace-app-playlist-detail.pen` |
| 03 | Now Playing | `planning/screen/03_now-playing.md` | `design/pace-app-now-playing.pen` |
| 04 | Search | `planning/screen/04_search.md` | `design/pace-app-search.pen` |
| 05 | Library | `planning/screen/05_library.md` | `design/pace-app-library.pen` |
| 06 | MyPage | `planning/screen/06_mypage.md` | `design/pace-app-mypage.pen` |
| 07 | Onboarding (3단계) | `planning/screen/07_onboarding.md` | `design/pace-app-onboarding.pen` |
| 08 | Auth (로그인/회원가입) | `planning/screen/08_auth.md` | `design/pace-app-auth.pen` |

### 3. 각 화면 구성 요약

**Home:**
- 상단 인사 + 프로필 아이콘
- 6개 섹션: 학습 요약 → 빠른 선택(2열 그리드) → 시간대별 추천 → 맞춤 추천 → 인기 → 신규
- 미니 플레이어 + 하단 네비 (Home/Search/Library)

**플레이리스트 상세:**
- Spotify 플레이리스트 1:1 벤치마크
- 히어로(240x240 커버 + 그라데이션) → 액션 바(▶ + ♥ + ↓) → 트랙 리스트(10개 세션)
- 학습/휴식 세션 시각적 구분 (흰색 vs #6A6A6A)
- 하단 추천: "이건 어떠신가요?"

**Now Playing:**
- "없애는 디자인" — 타이머(56px)가 시각적 핵심
- 커버 이미지(280x280) + 세션 정보 + 프로그레스 바 + 큰 타이머
- 컨트롤: ⏮ ⏸ ⏭
- 점 인디케이터로 전체 진행도 표시

**Search:**
- 검색창 + 카테고리 2열 그리드 (10개)
- 카테고리별 고유 컬러: 수능(빨강), 공무원(초록), 자격증(파랑) 등

**Library:**
- 필터 칩: 전체 | 저장한 | 수정 저장 | 최근 재생
- 플레이리스트 세로 리스트 (커버 56x56 + 제목 + 서브)
- 재사용 컴포넌트: PlaylistRow

**MyPage:**
- 프로필(64px 아바타 + 이름) + 스탯 3열(총 학습/연속/집중률)
- 메뉴 리스트: 학습 스탯, 설정, 구독 관리, 도움말, 앱 정보
- 로그아웃 (빨간색)

**Onboarding (3단계):**
- Step 1: 목표 선택 (6개 카드, 단일 선택)
- Step 2: D-Day 입력 (날짜 표시 + D-day 배지)
- Step 3: 가용 시간 (2x2 그리드)
- 공통: 진행 바 + 건너뛰기 + [다음] 버튼

**Auth:**
- 로그인: PACE 로고 + 소셜 3종(Google/Apple/카카오) + 이메일 로그인 + 하단 링크
- 회원가입: 입력 폼 4개 + 약관 동의 (전체/이용약관/개인정보/마케팅)

### 4. 디자인 일관성

- **Spotify 다크 테마 100% 준수:** #121212(배경) / #181818(elevated) / #282828(surface)
- **액센트:** #1DB954 (Spotify Green) — 플레이 버튼, 활성 상태, 선택 피드백에만 사용
- **폰트:** Inter 통일
- **디자인 시스템:** `design/design-guide.pen` 기반 토큰 활용

### 5. 발견된 수정 필요 사항

- **Library 하단 네비:** Create 탭이 포함되어 있음 → MVP에서 Create 제외했으므로 3탭(Home/Search/Library)으로 수정 필요
- **각 화면 디자인 세부 피드백:** PO 리뷰 후 수정 예정

---

## 현재 기획 진행 상황

| 산출물 | 상태 |
|---|---|
| 기능 목록 (Feature Map) | ✅ 완료 |
| 화면 설계서 (8개) | ✅ 완료 |
| 화면 디자인 (8개 .pen) | ✅ 완료 |
| 기능 명세서 (상세 스펙) | ❌ 미작성 (화면 기반 보완 예정) |
| 관리자 웹 Feature Map | ❌ 미작성 (위더 진행 예정) |
| 데이터 스키마 / API 설계 | ❌ 미작성 |

## Action Items

- [ ] PO: 전체 디자인 리뷰 및 피드백
- [ ] 위더 + 지수: 피드백 반영 수정
- [ ] 위더: 기능 명세서 초안 작성 (화면 설계 기반)
- [ ] 위더: 관리자 웹 Feature Map 설계
- [ ] PO + 위더: 다음 단계 (기능 명세 보완 or 기술 설계) 결정
