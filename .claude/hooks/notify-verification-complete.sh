#!/bin/bash
# Stage 검증 완료 시 PO에게 텔레그램 알림을 보낸다.
# PostToolUse 훅: Skill 도구에 적용

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
SKILL_NAME=$(echo "$INPUT" | jq -r '.tool_input.skill // empty' 2>/dev/null)

NOTIFY_SCRIPT="$CLAUDE_PROJECT_DIR/.infra/tools/telegram-notify.sh"

# Skill 도구가 아니면 통과
if [[ "$TOOL_NAME" != "Skill" ]]; then
  exit 0
fi

# verify-stage 스킬이 아니면 통과
if [[ "$SKILL_NAME" != "verify-stage" ]]; then
  exit 0
fi

# 알림 스크립트가 없으면 통과
if [[ ! -x "$NOTIFY_SCRIPT" ]]; then
  exit 0
fi

ARGS=$(echo "$INPUT" | jq -r '.tool_input.args // "Stage 미지정"' 2>/dev/null)

"$NOTIFY_SCRIPT" "✅ [검증 완료] Stage 검증이 완료되었습니다.
📋 ${ARGS}
👤 PO 최종 승인이 필요합니다."

exit 0
