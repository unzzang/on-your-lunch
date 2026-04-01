#!/bin/bash
# 위더가 전문 영역 파일을 직접 수정하려 할 때 위임 원칙을 상기시킨다.
# PreToolUse 훅: Write, Edit 도구에 적용
#
# 위더의 직접 수행 범위:
#   - 기능 명세 (specs/)
#   - 화면 설계 (screen/)
#   - 서비스 정의 (CLAUDE.md, feature-map 등)
#   - 회의록 (meeting-notes/)
#   - 의사결정 기록 (decision-making/)
#   - 인박스 (inbox/)
#   - .claude/ 인프라 (rules, skills, hooks, processes)
#   - .efforts/ 현황판
#   - .kits/ 템플릿
#   - .documents/ 회사 문서
#
# 그 외 전문 영역은 해당 팀에 위임해야 한다.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 파일 경로가 없으면 통과
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

BLOCKED=false
DOMAIN=""
OWNER=""

# ──────────────────────────────────────
# 개발팀 영역
# ──────────────────────────────────────

# 기술 스펙 (API, 백엔드, 프론트엔드) → 이명환 (백엔드 아키텍트, 개발팀장)
if [[ "$FILE_PATH" =~ tech-spec/ ]] || [[ "$FILE_PATH" =~ api-spec ]]; then
  BLOCKED=true
  DOMAIN="기술 스펙/API 스펙"
  OWNER="이명환 (백엔드 아키텍트, 개발팀장)"
fi

# ERD / 마이그레이션 → 이명환
if [[ "$FILE_PATH" =~ /erd/ ]] || [[ "$FILE_PATH" =~ migrations/ ]]; then
  BLOCKED=true
  DOMAIN="ERD/마이그레이션"
  OWNER="이명환 (백엔드 아키텍트)"
fi

# src/ 코드 (백엔드) → 이명환, 이인수
if [[ "$FILE_PATH" =~ /src/ ]] && [[ "$FILE_PATH" =~ backend ]] || [[ "$FILE_PATH" =~ /api/ ]]; then
  BLOCKED=true
  DOMAIN="백엔드 코드"
  OWNER="이명환 (아키텍트) / 이인수 (백엔드 개발자)"
fi

# src/ 코드 (프론트엔드) → 잭도슨
if [[ "$FILE_PATH" =~ /src/ ]] && [[ "$FILE_PATH" =~ frontend ]] || [[ "$FILE_PATH" =~ /app/ ]] || [[ "$FILE_PATH" =~ /components/ ]]; then
  BLOCKED=true
  DOMAIN="프론트엔드 코드"
  OWNER="잭도슨 (프론트엔드 리드)"
fi

# src/ 코드 (관리자 웹) → 톰하디
if [[ "$FILE_PATH" =~ /src/ ]] && [[ "$FILE_PATH" =~ admin ]]; then
  BLOCKED=true
  DOMAIN="관리자 웹 코드"
  OWNER="톰하디 (관리자 웹 개발자)"
fi

# src/ 코드 (일반 — 위 조건에 안 걸린 src/) → 개발팀
if [[ "$BLOCKED" == "false" ]] && [[ "$FILE_PATH" =~ /src/ ]] && [[ ! "$FILE_PATH" =~ design-preview/ ]]; then
  BLOCKED=true
  DOMAIN="코드"
  OWNER="개발팀 (이명환/잭도슨/이인수/톰하디)"
fi

# ──────────────────────────────────────
# 디자인팀 영역
# ──────────────────────────────────────

# 디자인 산출물 → 김지수 (UI/UX)
if [[ "$FILE_PATH" =~ 005_design/ ]] || [[ "$FILE_PATH" =~ \.pen$ ]]; then
  BLOCKED=true
  DOMAIN="디자인"
  OWNER="김지수 (UI/UX 디자이너)"
fi

# 디자인 프리뷰 HTML → 김지수
if [[ "$FILE_PATH" =~ design-preview/ ]]; then
  BLOCKED=true
  DOMAIN="디자인 프리뷰"
  OWNER="김지수 (UI/UX 디자이너)"
fi

# 썸네일, 배너, 크리에이티브 이미지 → 박소율 (그래픽)
if [[ "$FILE_PATH" =~ thumbnail ]] || [[ "$FILE_PATH" =~ banner ]] || [[ "$FILE_PATH" =~ creative ]]; then
  BLOCKED=true
  DOMAIN="그래픽 디자인 (썸네일/배너/크리에이티브)"
  OWNER="박소율 (그래픽 디자이너)"
fi

# ──────────────────────────────────────
# 리서치팀 영역
# ──────────────────────────────────────

# 리서치 보고서 → 리서치팀 6명
if [[ "$FILE_PATH" =~ 003_research/ ]] || [[ "$FILE_PATH" =~ research/ ]] && [[ "$FILE_PATH" =~ \.docs/ ]]; then
  BLOCKED=true
  DOMAIN="리서치 보고서"
  OWNER="리서치팀 (박선우/정하은/한도윤/윤서진/최재현/오민석)"
fi

# ──────────────────────────────────────
# 데이터팀 영역
# ──────────────────────────────────────

# 데이터 스펙, KPI, 이벤트 트래킹 → 톰크루즈
if [[ "$FILE_PATH" =~ data-spec ]] || [[ "$FILE_PATH" =~ data-rules ]]; then
  BLOCKED=true
  DOMAIN="데이터 스펙/KPI"
  OWNER="톰크루즈 (데이터 분석가)"
fi

# ──────────────────────────────────────
# QA/검증팀 영역
# ──────────────────────────────────────

# QA 산출물 → 진도준
if [[ "$FILE_PATH" =~ /qa/ ]] && [[ "$FILE_PATH" =~ \.docs/ ]]; then
  BLOCKED=true
  DOMAIN="QA 산출물"
  OWNER="진도준 (QA 엔지니어)"
fi

# 검증 결과 → 송현아
if [[ "$FILE_PATH" =~ 검증결과 ]] || [[ "$FILE_PATH" =~ verification ]]; then
  BLOCKED=true
  DOMAIN="검증 산출물"
  OWNER="송현아 (검증 전문가)"
fi

# ──────────────────────────────────────
# 콘텐츠팀 영역
# ──────────────────────────────────────

# 블로그 콘텐츠 → 강서연
if [[ "$FILE_PATH" =~ /blog/ ]] || [[ "$FILE_PATH" =~ /contents/.*blog ]]; then
  BLOCKED=true
  DOMAIN="블로그 콘텐츠"
  OWNER="강서연 (블로그 작가)"
fi

# 영상 스크립트 → 류현우
if [[ "$FILE_PATH" =~ /video/ ]] || [[ "$FILE_PATH" =~ script ]] && [[ "$FILE_PATH" =~ contents/ ]]; then
  BLOCKED=true
  DOMAIN="영상 콘텐츠"
  OWNER="류현우 (영상 크리에이터)"
fi

# ──────────────────────────────────────
# 마케팅팀 영역
# ──────────────────────────────────────

# 마케팅 전략/GTM → 한지민
if [[ "$FILE_PATH" =~ marketing/ ]] && [[ "$FILE_PATH" =~ \.docs/ ]]; then
  BLOCKED=true
  DOMAIN="마케팅 전략"
  OWNER="한지민 (그로스 마케터)"
fi

# SNS 콘텐츠 → 이수빈
if [[ "$FILE_PATH" =~ /sns/ ]]; then
  BLOCKED=true
  DOMAIN="SNS 콘텐츠"
  OWNER="이수빈 (SNS 매니저)"
fi

# ──────────────────────────────────────
# 운영팀 영역
# ──────────────────────────────────────

# CS 관련 → 정예림
if [[ "$FILE_PATH" =~ /cs/ ]] && [[ "$FILE_PATH" =~ \.docs/ ]]; then
  BLOCKED=true
  DOMAIN="CS 문서"
  OWNER="정예림 (CS 매니저)"
fi

# 운영/장애 대응 → 최민호
if [[ "$FILE_PATH" =~ /operations/ ]] && [[ "$FILE_PATH" =~ \.docs/ ]]; then
  BLOCKED=true
  DOMAIN="운영 문서"
  OWNER="최민호 (서비스 운영 매니저)"
fi

# ──────────────────────────────────────
# 결과 출력
# ──────────────────────────────────────

if [[ "$BLOCKED" == "true" ]]; then
  cat >&2 << EOF
[위임 원칙 위반 경고]
위더가 "${DOMAIN}" 영역 파일을 직접 수정하려 합니다.
이 작업은 ${OWNER}에게 위임해야 합니다.

파일: ${FILE_PATH}

위더의 직접 수행 범위: 기능 명세(specs/), 화면 설계(screen/), 서비스 정의, 회의록, DR, 인박스, .claude/ 인프라
그 외 전문 영역은 해당 전문 에이전트가 수행합니다. (delegation.md 참조)

정말 위더가 직접 수정해야 하는 경우라면 PO 승인 후 진행하세요.
EOF
  exit 2
fi

exit 0
