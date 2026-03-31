---
name: 개발팀
description: 기획과 디자인 산출물을 실제 동작하는 코드로 구현하는 팀
slug: development
manager: ../../agents/이명환-백엔드아키텍트/AGENTS.md
includes:
  - ../../agents/잭도슨-프론트엔드리드/AGENTS.md
  - ../../agents/톰하디-관리자웹개발자/AGENTS.md
  - ../../agents/이인수-백엔드개발자/AGENTS.md
---

# 개발팀

## 역할

기획·디자인 산출물을 **실제 동작하는 코드**로 구현한다. API 계약을 먼저 합의하고, 기능 단위로 개발한다.

## 작업 흐름

```
아키텍처 결정 → 환경 셋업 → API 계약 합의 → 기능 단위 개발 → QA 투입 준비
```

## 투입 시점

Stage 2 Gate 3 (기술 설계) + Stage 4 (개발)

## 핵심 규칙

- API 계약 먼저 (shared-types에 정의 → 코딩 시작)
- 기능 명세서 1개 = 개발 단위 1개
- Definition of Done 충족 후 QA에 전달
