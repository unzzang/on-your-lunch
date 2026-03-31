#!/bin/bash
# .docs/ 문서 작성 시 가짜 데이터 패턴을 감지하여 차단한다.
# PreToolUse 훅: Write, Edit 도구에 적용

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# .docs/ 하위 파일이 아니면 통과
if [[ ! "$FILE_PATH" =~ \.docs/ ]]; then
  exit 0
fi

# Write 도구의 content, Edit 도구의 new_string 추출
if [[ "$TOOL_NAME" == "Write" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [[ "$TOOL_NAME" == "Edit" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi

# 가짜 데이터 패턴 감지
FAKE_PATTERNS=(
  "~로 추정된다"
  "~로 예상된다"
  "시뮬레이션 결과"
  "AI가 분석한 결과"
  "가상의"
  "모의 데이터"
  "예시 데이터"
  "임의로 설정"
)

for PATTERN in "${FAKE_PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qF "$PATTERN"; then
    echo "차단: 문서에 가짜/추정 데이터 패턴 감지됨 — '$PATTERN'. 검증된 출처의 실제 데이터만 사용하세요. 데이터가 없으면 '데이터 없음'으로 표기하세요." >&2
    exit 2
  fi
done

exit 0
