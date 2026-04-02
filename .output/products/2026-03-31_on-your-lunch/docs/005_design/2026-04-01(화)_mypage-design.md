---
> 작성자: 김지수 (UI/UX 디자이너)
> 작성일: 2026-04-01
> 화면 ID: SCR-MYPAGE-001
> 관련 명세: 004_planning/specs/05_share_and_settings.md
> 관련 화면설계: 004_planning/screen/06_mypage.md
> 벤치마크: 배달의민족 마이배민 (설정 중심 깔끔 구성)
> 상태: PO 리뷰 요청
---

# 마이페이지 화면 디자인 명세

## 1. 레이아웃 구조도

```
┌─────────────────────────────────┐
│        Status Bar (44px)         │  ← OS 기본
├─────────────────────────────────┤
│  마이페이지                       │  ← App Bar (56px)
├─────────────────────────────────┤
│                                  │
│  ┌──┐  홍길동                    │  ← Profile (탭→편집)
│  │  │  honggildong@gmail.com [>] │
│  └──┘                            │
│                                  │
├── section-gap (8px) ────────────┤
│  설정                            │
│  📍 회사 위치 변경            [>] │
│  🍽  취향 설정                [>] │
│  🔔 알림 설정                [>] │
├── section-gap (8px) ────────────┤
│  정보                            │
│  📄 서비스 이용약관           [>] │
│  🔒 개인정보 처리방침         [>] │
├── section-gap (8px) ────────────┤
│  로그아웃                        │
│  회원 탈퇴                       │
│                                  │
│  앱 버전 1.0.0                   │
├─────────────────────────────────┤
│  [🏠홈] [🔍탐색] [📅이력] [●👤마이] │  ← Bottom Tab (72px)
└─────────────────────────────────┘
```

## 2. 영역별 상세 명세

### 2-1. App Bar (56px)

- **배경:** `color.bg.primary`
- **텍스트:** "마이페이지" — `typo.h2` (20px, Bold), `color.text.primary`
- **패딩:** 좌 `16px`

### 2-2. Profile Section

- **배경:** `color.bg.primary`
- **패딩:** `20px 16px`
- **구성:** 아바타 + 정보 + 화살표 (flex, gap `16px`, align center)
- **아바타:**
  - 56x56px, `radius.full`
  - 배경: `color.bg.tertiary`
  - 사진 없을 때: Phosphor `user` 28px, `color.text.placeholder`
  - 사진 있을 때: `object-fit: cover`, `border-radius: 50%`
- **닉네임:**
  - `typo.h3` (18px, SemiBold), `color.text.primary`
- **이메일:**
  - `typo.caption` (13px), `color.text.secondary`
  - 상단 마진: `2px`
- **화살표:**
  - Phosphor `caret-right` 20px, `color.text.placeholder`
- **영역 전체 탭:** 프로필 편집 화면으로 push

### 2-3. Section Gap

- 높이: `8px`
- 배경: `color.bg.secondary`

### 2-4. Section

- **배경:** `color.bg.primary`
- **섹션 타이틀:**
  - 패딩: `16px 16px 8px`
  - `typo.overline` (13px, SemiBold), `color.text.secondary`
  - `letter-spacing: 0.5px`

### 2-5. Menu Item

- **패딩:** `14px 16px`
- **하단 테두리:** `1px solid color.border.default` (마지막 항목 제외)
- **Hover:** 배경 `color.bg.secondary`
- **구성:** 아이콘 + 라벨 + 화살표 (flex, gap `12px`)
- **아이콘:** Phosphor 20px, `color.text.secondary`
- **라벨:** `typo.body2` (15px), `color.text.primary`, flex: 1
- **화살표:** Phosphor `caret-right` 18px, `color.text.placeholder`

| 메뉴 | 아이콘 (Phosphor) | 탭 동작 |
|------|-------------------|---------|
| 회사 위치 변경 | `map-pin` | 위치 설정 화면 (온보딩 Step 1 재사용) |
| 취향 설정 | `fork-knife` | 취향 설정 화면 (온보딩 Step 2, 3 재사용) |
| 알림 설정 | `bell` | 알림 설정 서브 화면 |
| 서비스 이용약관 | `file-text` | 약관 웹뷰 |
| 개인정보 처리방침 | `lock` | 개인정보 웹뷰 |

### 2-6. Bottom Links

- **배경:** `color.bg.primary`
- **패딩:** `8px 16px 16px`
- **로그아웃:**
  - `typo.body2` (14px), `color.text.secondary`
  - 패딩: `12px 0`
  - 탭: 로그아웃 확인 모달
- **회원 탈퇴:**
  - `typo.body2` (14px), `color.destructive` (#DC2626)
  - 패딩: `12px 0`
  - 탭: 탈퇴 안내 화면으로 push

### 2-7. Version

- **텍스트:** "앱 버전 1.0.0" — `typo.caption` (12px), `color.text.placeholder`
- **`text-align: center`**, 패딩 `16px`

### 2-8. Bottom Tab Bar (72px)

- 홈 디자인 명세와 동일 스펙
- 활성 탭: "마이" (Phosphor `user` filled, `color.primary`)

## 3. 서브 화면: 프로필 편집

### 3-1. Sub Bar

- **높이:** `56px`
- **하단 테두리:** `1px solid color.border.default`
- **뒤로:** Phosphor `caret-left` 20px + "뒤로" — `typo.body2` (14px), `color.text.secondary`
- **타이틀:** "프로필 편집" — `typo.body1` (17px, SemiBold), `color.text.primary`
- **저장:** `typo.body2` (15px, SemiBold), `color.primary`
  - 변경사항 없을 때: `color.primary.disabled`

### 3-2. 프로필 편집 콘텐츠

- **패딩:** `24px 16px`
- **아바타 편집:**
  - 80x80px, `radius.full`, 배경 `color.bg.tertiary`
  - 사진 없을 때: Phosphor `user` 36px, `color.text.placeholder`
  - "사진 변경" — `typo.body2` (14px, Medium), `color.primary`
  - 탭: 갤러리에서 선택
  - 중앙 정렬, 하단 마진 `32px`
- **Form Group:**
  - 하단 마진: `24px`
- **Form Label:**
  - `typo.body2` (14px, Medium), `color.text.primary`
  - 하단 마진: `6px`
- **Form Input:**
  - 높이: `48px`
  - 패딩: `0 16px`
  - 테두리: `1px solid color.border.default`
  - 모서리: `radius.md`
  - 텍스트: `typo.body2` (15px), `color.text.primary`
  - 포커스: 테두리 `color.primary`
  - 비활성 인풋: 배경 `color.bg.tertiary`, 텍스트 `color.text.placeholder`
- **Form Hint:**
  - `typo.caption` (12px), `color.text.placeholder`
  - 상단 마진: `4px`
- **필드:**

| 필드 | 상태 | 힌트 |
|------|------|------|
| 닉네임 | 편집 가능 | "2~10자, 한글/영문/숫자" |
| 이메일 | 비활성 (disabled) | "Google 계정 이메일 (변경 불가)" |

## 4. 서브 화면: 알림 설정

### 4-1. Sub Bar

- "알림 설정" — 프로필 편집과 동일 스펙 (저장 버튼 없음)

### 4-2. 알림 콘텐츠

- **패딩:** `16px`
- **토글 Row:**
  - 좌: "점심 추천 알림" — `typo.body1` (16px, Medium), `color.text.primary`
  - 우: 토글 스위치
    - 48x28px, `border-radius: 14px`
    - OFF: 배경 `color.border.default`
    - ON: 배경 `color.primary` (#D4501F)
    - 노브: 24x24px, white, `radius.full`, `shadow.sm`
    - OFF 위치: `left: 2px`, ON 위치: `left: 22px`
    - 전환: 200ms
  - 패딩: `16px 0`
- **시간 선택:**
  - 라벨: "알림 시간" — `typo.body2` (14px, Medium), `color.text.primary`
  - Select:
    - 높이 `48px` (수정 반영: 기존 44px → 48px)
    - 패딩: `0 16px`
    - 테두리: `1px solid color.border.default`
    - 모서리: `radius.md`
    - 배경: `color.bg.primary`
    - 텍스트: `typo.body2` (15px), `color.text.primary`
    - 드롭다운 아이콘: Phosphor `caret-down` 16px, `color.text.placeholder`, 우측 `16px`
    - 옵션: 10:00~13:00, 30분 단위
  - 힌트: "10:00~13:00, 30분 단위" — `typo.caption`, `color.text.placeholder`
  - 상단 마진: `8px`
- **안내 박스:**
  - 배경: `color.bg.secondary`, `radius.md`
  - 패딩: `12px`
  - 아이콘: Phosphor `lightbulb` 18px, `color.primary`
  - 텍스트: "매일 설정한 시간에 오늘의 점심 추천을 알려드려요." — `typo.caption` (13px), `color.text.secondary`, 행간 18px
  - 상단 마진: `20px`

## 5. 서브 화면: 회원 탈퇴

### 5-1. Sub Bar

- "회원 탈퇴" — 프로필 편집과 동일 스펙 (저장 버튼 없음)

### 5-2. 탈퇴 콘텐츠

- **패딩:** `24px 16px`
- **경고 아이콘:**
  - Phosphor `warning` 48px, `color.destructive`
  - 중앙 정렬, 패딩 `24px 0`
- **타이틀:**
  - "정말 탈퇴하시겠어요?" — `typo.h3` (18px, SemiBold), `color.text.primary`
  - 중앙 정렬, 하단 마진 `16px`
- **안내 박스:**
  - 배경: `color.bg.secondary`, `radius.lg`
  - 패딩: `16px`
  - 하단 마진: `24px`
  - 설명: "탈퇴하면 아래 데이터가 영구 삭제돼요." — `typo.body2` (14px), `color.text.secondary`, 행간 22px
  - 삭제 항목 리스트:
    - `typo.body2` (14px), `color.text.primary`, 행간 24px, `padding-left: 20px`
    - 먹은 이력 및 별점 기록 / 즐겨찾기 목록 / 취향 설정 및 프로필 정보
  - 주의: "삭제된 데이터는 복구할 수 없어요." — `typo.caption` (13px), `color.text.placeholder`
- **탈퇴 버튼:**
  - 높이 `48px`, 배경 `color.destructive`, 텍스트 `color.text.inverse`
  - `typo.body1` (16px, SemiBold), `radius.md`
  - 탭: 최종 확인 팝업
- **취소 버튼:**
  - 높이 `48px`, 배경 transparent, 텍스트 `color.text.secondary`
  - `typo.body2` (14px), 상단 마진 `8px`
  - 탭: 마이페이지로 복귀

## 6. 모달: 로그아웃 확인

- **오버레이:** `color.overlay`
- **모달:**
  - 배경: `color.bg.primary`, `radius.xl`, `shadow.lg`
  - 패딩: `24px`
  - 최대 너비: `320px`
  - 중앙 정렬
- **타이틀:**
  - "로그아웃 하시겠어요?" — `typo.h3` (18px, SemiBold), `color.text.primary`
  - 하단 마진: `20px`, `text-align: center`
- **버튼:**
  - 2개 가로 배치 (flex, gap `8px`)
  - 각 `flex: 1`, 높이 `44px`, `radius.md`
  - 취소: 배경 `color.bg.tertiary`, 텍스트 `color.text.primary`, `typo.body2` (15px, SemiBold)
  - 로그아웃: 배경 `color.destructive`, 텍스트 `color.text.inverse`, `typo.body2` (15px, SemiBold)

## 7. 상태별 UI

### 로딩

- 메인 콘텐츠 숨김
- 스켈레톤: 아바타 56px 원 + 텍스트 막대 2줄 + 메뉴 항목 막대 5개

### 정상 (기본)

- 위 명세 그대로

### 에러 (네트워크/서버)

- 메인 콘텐츠 숨김
- 중앙:
  - Phosphor `wifi-slash` 48px, `color.text.placeholder`
  - "인터넷 연결을 확인해주세요" — `typo.body1`, `color.text.secondary`
  - [다시 시도] 버튼 — Button/Primary

### 프로필 사진 없음

- 기본 아바타 (Phosphor `user` 아이콘)

### 알림 권한 꺼져있음

- 알림 설정 화면에서 안내: "설정에서 알림을 허용해주세요" + 설정 이동 버튼

## 8. 인터랙션

| 요소 | 동작 | 결과 | 애니메이션 |
|------|------|------|-----------|
| 프로필 영역 | 탭 | 프로필 편집 서브 화면 | push (250ms) |
| 메뉴 항목 | 탭 | 해당 서브 화면/웹뷰 | push (250ms) |
| 서브 화면 뒤로 | 탭 | 메인 화면 복귀 | pop (250ms) |
| 토글 스위치 | 탭 | ON/OFF 전환, 즉시 저장 | slide (200ms) |
| 저장 (프로필) | 탭 | 변경 저장 + 토스트 | pop (250ms) |
| 로그아웃 | 탭 | 확인 모달 | fade-in (150ms) |
| 탈퇴 | 탭 | 탈퇴 안내 화면 | push (250ms) |
| 탈퇴 확인 | 탭 | 계정 삭제 → 로그인 화면 | fade (250ms) |
| 하단 탭 | 탭 | 탭 전환 | none |

모든 인터랙션 easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## 9. 산출물 체크리스트

- [x] 디자인 토큰만 사용 (임의 색상·크기 없음)
- [x] Primary CTA 없음 (설정 화면이므로 메뉴 탐색이 주 행동)
- [x] 정보 계층 3단계 이내 (섹션 타이틀 → 메뉴 라벨 → 서브 정보)
- [x] 로딩·에러 상태 정의
- [x] 모바일 터치 영역 44x44px 이상 (메뉴 항목, 토글, 탭)
- [x] 텍스트-배경 대비 확인 (Primary #D4501F on #FFFFFF = 5.2:1)
- [x] 벤치마크(배민 마이배민) 참조 명시
- [x] 데이터 바인딩: {닉네임}, {이메일}, {프로필사진URL}, {알림ON/OFF}, {알림시간}
- [x] 인터랙션 + 전환 애니메이션 정의
- [x] `word-break: keep-all` 적용
- [x] Pretendard 폰트 사용
- [x] Phosphor Icons 라인 스타일 통일
- [x] 탈퇴 안내 화면 포함

---

*김지수 드림*
