# PACE 디자인 도구 환경 구축 및 테스트

> 일시: 2026-03-16
> 참석: PO(사용자), 위더(AI 시니어 기획자), 김지수(AI UI/UX 디자이너 — 테스트 참여)

## 논의 배경

Sub Agent와 Skill 구현 완료 후, 디자인 시각화 도구를 검증하고 환경을 구축하는 작업. 김지수가 실제로 디자인을 만들고, PO가 확인/편집할 수 있는 환경이 필요했다.

---

## 핵심 결정 사항

### 1. Pencil MCP 디자인 테스트 — 성공

김지수(Sub Agent)를 통해 PACE 홈 화면 프로토타입을 Pencil MCP로 제작. 결과:

- **디자인 퀄리티:** 양호. 다크 테마 + Spotify 그린 액센트, 카드 캐러셀, Now Playing 미니 플레이어, 4탭 네비게이션 등 핵심 구조 구현됨.
- **산출물:** `design/images/` 폴더에 PNG 내보내기
- **디자인 시스템:** `design/design-guide.pen` — Spotify 다크 테마 기반 컬러/타이포/컴포넌트 정의
- **대시보드 테스트:** `design/test.pen` — Swiss Clean 스타일 대시보드 프로토타입

**추가 확인 사항:**
- `.pen` 파일은 Pencil MCP 도구(`batch_get`, `batch_design` 등)로만 접근 가능
- `open_document`로 새 `.pen` 파일 생성 가능 (경로 지정)
- 이미지 내보내기(PNG/JPEG/PDF) 지원
- PO는 IDE(VSCode) 내 Pencil 에디터에서 디자인을 직접 확인/편집 가능

### 2. Figma MCP — 사용하지 않기로 결정

초기 검토 단계에서 Figma MCP 추가 연결을 고려했으나, **Pencil MCP만으로 충분**하다고 판단하여 Figma는 사용하지 않기로 최종 결정.

**결정 사유:**
- Pencil MCP로 프로토타입 + 디자인 시스템 + 컴포넌트 관리가 모두 가능
- 추가 도구 도입에 따른 관리 복잡도 증가 불필요
- 설치했던 Figma MCP 설정은 삭제 완료

### 3. 디자인 도구 전략: Pencil 단독 사용

| 용도 | 방법 |
|---|---|
| 빠른 프로토타입 | Pencil MCP로 `.pen` 파일 생성 |
| 디자인 시스템 관리 | `design/design-guide.pen`에 컬러/타이포/컴포넌트 정의 |
| 정교한 화면 디자인 | 김지수 에이전트가 Pencil MCP로 제작 |
| PO 검수 | IDE 내 Pencil 에디터에서 직접 확인 |
| 산출물 공유 | `design/images/`에 PNG/JPEG/PDF 내보내기 |

### 4. 디자인 산출물 관리

- `design/` 폴더에서 통합 관리
- `.pen` 파일: 디자인 원본 (Pencil MCP로 접근)
- `design/images/`: 내보낸 이미지 파일

---

## 미결 사항

없음 (모두 해결됨)

## 해결된 사항

- **`.pen` 파일 저장 이슈** — Pencil MCP에서 자동 저장이 지원되지 않음. **디자인 완료 후 위더가 PO에게 저장 요청 → PO가 VSCode에서 수동 저장(Cmd+S / Cmd+Shift+S)하는 프로세스로 확정.**

## Action Items

- [ ] PO + 위더: Step 3 기능 명세 착수 — AI 스케줄링 알고리즘 논의
