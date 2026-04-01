#!/bin/bash
# 디자인/개발 작업 완료 시 텔레그램 알림을 보낸다.
# PostToolUse 훅: Agent 도구에 적용

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
DESCRIPTION=$(echo "$INPUT" | jq -r '.tool_input.description // empty' 2>/dev/null)

NOTIFY_SCRIPT="$CLAUDE_PROJECT_DIR/.infra/tools/telegram-notify.sh"

# Agent 도구가 아니면 통과
if [[ "$TOOL_NAME" != "Agent" ]]; then
  exit 0
fi

# 알림 스크립트가 없으면 통과
if [[ ! -x "$NOTIFY_SCRIPT" ]]; then
  exit 0
fi

# 디자인 관련 키워드 감지
if echo "$DESCRIPTION" | grep -qiE "디자인|design|HTML|CSS|화면|UI|UX|김지수|박소율"; then
  "$NOTIFY_SCRIPT" "✅ [디자인] 작업이 완료되었습니다.
📋 ${DESCRIPTION}"
  exit 0
fi

# 개발 관련 키워드 감지
if echo "$DESCRIPTION" | grep -qiE "백엔드|프론트|개발|backend|frontend|NestJS|Expo|API 구현|세팅|이명환|잭도슨|이인수|톰하디"; then
  "$NOTIFY_SCRIPT" "✅ [개발] 작업이 완료되었습니다.
📋 ${DESCRIPTION}"
  exit 0
fi

exit 0
