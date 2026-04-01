# 개발 규칙

## API 계약 먼저

코드를 작성하기 전에 프론트↔백엔드가 요청/응답 타입을 합의한다. shared-types에 정의.

## 기능 단위 개발

기능 명세서 1개 = 개발 단위 1개. 백엔드 API → 프론트 화면 → 연동 확인.

## Definition of Done

**백엔드와 프론트엔드 모두 완료되어야 Stage 4(개발) 완료로 판정한다.** 한쪽만 완료된 상태에서 QA 또는 다음 Stage로 넘기지 않는다.

아래를 **모두** 충족해야 QA에 넘긴다:
- 백엔드: API 비즈니스 로직 구현 완료 + 빌드/테스트/린트 통과
- 프론트엔드: **실제 화면 UI 구현 완료** (빈 컴포넌트/구조만은 미완료 상태)
- 프론트↔백엔드 연동 확인 (API 호출 → 화면 표시)
- shared-types와 실제 API 응답 일치
- 시뮬레이터에서 기본 동작 확인

## 버그 수정 후

자체 테스트 통과 ≠ 수정 완료. QA 엔지니어의 재검증(Verified) 판정까지 "수정 중" 상태.

## 프로젝트 세팅 규칙

프로젝트 초기 세팅 시 반드시 수행:

1. **CLAUDE.md에 프로젝트 구조 반영** — 실제 생성된 폴더/파일 구조를 CLAUDE.md의 "프로젝트 구조" 섹션에 기록한다. 개발팀이 작업 시작 시 CLAUDE.md만 보고 전체 구조를 파악할 수 있어야 한다.
2. **CLAUDE.md에 개발 명령어 반영** — 빌드, 테스트, 린트, 마이그레이션 등 실행 명령어를 기록한다.
3. **shared-types 먼저 정의** — 프론트↔백엔드 API 타입을 shared-types에 먼저 합의한 후 구현에 착수한다.

## node_modules 규칙

- **워크스페이스 루트(`src/`)에만 node_modules를 설치한다.** 하위 패키지(`apps/api/`, `apps/mobile/`, `packages/shared-types/`)에 개별 node_modules를 생성하지 않는다.
- pnpm workspace가 루트의 node_modules를 공유하는 구조이므로, 하위에서 `npm install`이나 `pnpm install`을 개별 실행하지 않는다.
- 의존성 추가 시: 루트에서 `pnpm add {패키지} --filter {워크스페이스명}` 으로 설치한다.
- 하위 패키지에 node_modules가 발견되면 즉시 삭제하고 루트에서 `pnpm install`을 다시 실행한다.

## 커밋 규칙

- 기능: `feat: [SPEC-번호] 기능명`
- 버그: `fix: [BUG-번호] 수정 내용`
- 리팩토링: `refactor: 내용`
