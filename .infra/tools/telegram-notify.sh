#!/bin/bash
# 텔레그램 알림 전송 스크립트
# 사용법: ./telegram-notify.sh "메시지 내용"
# 환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

# .env 파일에서 환경변수 로드
if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
fi

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

if [[ -z "$BOT_TOKEN" || -z "$CHAT_ID" ]]; then
  echo "TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID가 설정되지 않았습니다." >&2
  exit 1
fi

MESSAGE="${1:-알림 메시지가 없습니다.}"

curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": ${CHAT_ID}, \"text\": \"${MESSAGE}\", \"parse_mode\": \"HTML\"}" > /dev/null 2>&1

exit 0
