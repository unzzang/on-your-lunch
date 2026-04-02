---
> 프로젝트: 온유어런치
> 작성자: 김지수 (UI/UX 디자이너)
> 작성일: 2026-03-30
> 수정일: 2026-04-01
> UX 벤치마크: 배달의민족 (화이트 기반, 깔끔, 미니멀)
> 상태: 확정
---

# 온유어런치 디자인 시스템

> 회사 표준(`rules/design/design-tokens.md`)의 토큰 구조에 이 프로젝트의 고유 값을 채운 문서.

## 브랜드 방향

- **한 줄 설명:** 강남 직장인의 점심 고민을 가볍게 해결하는 깔끔한 앱
- **UX 벤치마크:** 배달의민족 — 화이트 기반, 친근하면서도 깔끔한 UI
- **톤:** 밝은, 깔끔, 미니멀, 친근한
- **경어체:** 하세요체

## 색상

| 토큰 이름 | 값 | 비고 |
|----------|------|------|
| `color.primary` | **#D4501F** | 오렌지 — 식욕 자극 + 에너지 (WCAG AA 대비 5.2:1) |
| `color.primary.hover` | #B8441A | primary보다 약간 어둡게 |
| `color.primary.disabled` | #E8A78E | primary의 연한 버전 |
| `color.secondary` | #6B7280 | 회사 기본값 유지 (Gray-500) |
| `color.destructive` | #DC2626 | 회사 기본값 유지 |
| `color.success` | #16A34A | 회사 기본값 유지 |
| `color.warning` | #F59E0B | 회사 기본값 유지 |
| `color.bg.primary` | #FFFFFF | 화이트 기반 |
| `color.bg.secondary` | #F9FAFB | 카드/섹션 배경 |
| `color.bg.tertiary` | #F3F4F6 | 비활성 칩, 인풋 배경 |
| `color.border.default` | #E5E7EB | 회사 기본값 유지 |
| `color.border.focus` | #D4501F | primary 재사용 |
| `color.text.primary` | #111827 | 회사 기본값 유지 |
| `color.text.secondary` | #6B7280 | 회사 기본값 유지 |
| `color.text.placeholder` | #9CA3AF | 회사 기본값 유지 |
| `color.text.inverse` | #FFFFFF | 회사 기본값 유지 |
| `color.overlay` | #000000 50% | 회사 기본값 유지 |
| `color.toast.bg` | #1F2937 | 회사 기본값 유지 |

### 카테고리 색상

ERD의 CATEGORY 테이블 color_code와 일치시킨 카테고리별 색상 토큰이다. 캘린더 dot, 지도 핀, 카테고리 뱃지 등에서 사용한다.

| 토큰 이름 | 값 | 비고 |
|----------|------|------|
| `color.category.korean` | #FF8C00 | 한식 |
| `color.category.chinese` | #FF0000 | 중식 |
| `color.category.japanese` | #0066FF | 일식 |
| `color.category.western` | #00AA00 | 양식 |
| `color.category.asian` | #9900CC | 아시안 |
| `color.category.snack` | #FFCC00 | 분식/간편식 |
| `color.category.salad` | #66CC00 | 샐러드/건강식 |
| `color.rating` | #FBBF24 | 별점 색상 |

## 폰트

| 용도 | 폰트 | 비고 |
|------|------|------|
| 한글 | **Pretendard** | 모든 텍스트 |
| 영문/숫자 | Pretendard | 통일 |
| `word-break` | `keep-all` | 모든 한글 블록 |
| 제목 `text-wrap` | `balance` | 고아 단어 방지 |

## 아이콘

- 스타일: **Line (outlined)**, 1.5px
- 라이브러리: Phosphor Icons (라인 스타일이 미니멀 톤에 부합)
- 크기: 16px(인라인) / 20px(버튼 내부) / 24px(네비게이션)

## Anti-Pattern (이 프로젝트 금지)

- **금지 컬러:** 다크 배경 (#000, #121212), 네온, 보라색 그라데이션
- **금지 패턴:** 복잡한 그라데이션, 그림자 과다 사용, 정보 4단계 이상 계층
- **금지 폰트:** Inter, Roboto, 장식 폰트 — Pretendard만 사용
- **금지 표현:** "혁신적인", "원활한" 등 AI 클리셰

## Dark 모드

MVP에서는 Light 모드만 지원.
