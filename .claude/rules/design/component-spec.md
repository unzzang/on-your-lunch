# 컴포넌트 명세 작성 규칙

> 모든 컴포넌트를 아래 형식으로 기술한다. 누락 항목 없이 작성한다.

## 명세 형식

```
### [컴포넌트 이름] — [변형(Variant)]

- **유형:** [카테고리] / [Variant]
- **크기:** Height ○○px, Padding ○○px ○○px
- **배경:** Default(○○) / Hover(○○) / Active(○○) / Disabled(○○)
- **텍스트:** [typo 토큰], [color 토큰]
- **모서리:** [radius 토큰]
- **테두리:** [border 유무, 색상, 굵기]
- **그림자:** [shadow 토큰 또는 없음]
- **아이콘:** [위치(좌/우/단독)] [크기] [색상] [텍스트와 간격]
- **상태:** Default → Hover → Active → Focused → Disabled → Loading
- **접근성:** 최소 터치 영역 ○○×○○px / 대비 비율 / aria 속성
- **플랫폼 차이:** [모바일과 웹에서 다른 점]
```

## 기본 컴포넌트 스펙 (빠른 참조)

### Button / Primary
- Height: 48px(모바일) / 40px(웹), Padding: 0 20px
- 배경: `color.primary` / Hover `color.primary.hover` / Disabled `color.primary.disabled`
- 텍스트: `typo.body2` Bold, `color.text.inverse`
- 모서리: `radius.md`
- 로딩: 텍스트 → 스피너(20px) 교체, 버튼 크기 유지

### Button / Secondary
- Height: 위와 동일
- 배경: transparent / Hover `color.bg.tertiary`
- 테두리: 1px solid `color.border.default`
- 텍스트: `typo.body2` Medium, `color.text.primary`

### Button / Text (Ghost)
- 배경: transparent / Hover `color.bg.secondary`
- 테두리: 없음

### Input / Text Field
- Height: 48px(모바일) / 40px(웹)
- 테두리: 1px `color.border.default` / Focused 2px `color.border.focus`
- 에러: 테두리 `color.destructive`, 하단 에러 메시지 `typo.caption`
- 레이블: 상단 `typo.body2` Medium, 레이블-인풋 간격 6px

### Card
- 배경: `color.bg.primary`
- 테두리: 1px `color.border.default` 또는 `shadow.sm`
- 모서리: `radius.lg`
- 내부 패딩: 16px(모바일) / 20px(웹)

### Toast / Snackbar
- 위치: 화면 하단 중앙, 바텀 네비 위 16px
- 배경: `color.toast.bg` (기본값 #1F2937), 텍스트 `color.text.inverse`
- 자동 닫힘: 3초 (액션 있으면 5초). 최대 2줄.

### Modal / Dialog
- 오버레이: `color.overlay` (기본값 #000000 50%)
- 모서리: `radius.xl`
- 그림자: `shadow.lg`
- 내부 패딩: 24px
- 최대 너비: 400px(모바일) / 480px(웹)

### Bottom Sheet (모바일)
- 상단 핸들: 32×4px, `color.border.default`, 중앙
- 모서리: 상단만 `radius.xl`
- 최대 높이: 화면의 90%

## 모션/애니메이션 규격

| 항목 | 규격 |
|------|------|
| 기본 easing | `cubic-bezier(0.16, 1, 0.3, 1)` — 모든 인터랙션 요소에 통일 |
| 전환 시간 | 빠른(150ms) / 보통(250ms) / 느린(350ms) |
| GPU 최적화 | `transform`과 `opacity`만 애니메이션. `top/left/width/height` 금지 |
| 스크롤 진입 | 순차 딜레이 `calc(index * 80ms)` |
| 화면 전환 | push(좌→우) / modal(하→상) / fade / none 중 명시 |

## 반응형 브레이크포인트

| 구간 | 너비 | 레이아웃 |
|------|------|---------|
| Mobile | < 768px | 1컬럼, 바텀 네비게이션 |
| Tablet | 768~1279px | 2컬럼, 사이드바 접힘 |
| Desktop | ≥ 1280px | 3컬럼, 사이드바 펼침 |

## 완성도 규칙

AI가 디자인 산출물을 생성할 때 아래를 금지한다:

- ❌ `<!-- 나머지 섹션 생략 -->` 같은 주석
- ❌ "비슷하게 반복", "나머지는 동일" 같은 축약
- ❌ 첫 번째 화면만 상세하고 나머지는 생략
- ✅ 요청된 모든 화면/컴포넌트를 빠짐없이 완성

## 산출물 체크리스트

화면 설계 완료 후 반드시 확인:

- [ ] 디자인 토큰만 사용했는가? (임의 색상·크기 없음)
- [ ] Primary CTA가 화면당 1개인가?
- [ ] 정보 계층이 3단계 이내인가?
- [ ] 로딩·빈 상태·에러 상태가 모두 정의되었는가?
- [ ] 모바일 터치 영역이 44×44px 이상인가?
- [ ] 텍스트-배경 대비가 4.5:1 이상인가?
- [ ] 벤치마크 참조가 명시되었는가?
- [ ] 데이터 바인딩(API 필드)이 명시되었는가?
- [ ] 인터랙션과 전환 애니메이션이 정의되었는가?
