# 온유어런치 (On Your Lunch)

강남 직장인의 점심 메뉴 고민을 해결하는 모바일 앱.

회사 위치 + 취향 + 먹은 이력 기반으로 매일 점심 식당 3곳을 추천합니다.

## 핵심 기능 (MVP)

- 오늘의 추천 — 매일 3곳 카드 추천, 하루 5회 새로고침
- 필터 — 카테고리(7종), 도보 거리(5/10/15분), 가격대(3단계)
- 먹은 이력 — 별점 + 메모, 캘린더 뷰
- 식당 탐색 — 지도 뷰 + 리스트 뷰, 검색, 즐겨찾기
- 카카오톡 공유 — 식당 정보 공유 + 딥링크

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | NestJS 11 + Prisma 6 + PostgreSQL 16 (PostGIS) |
| 모바일 | Expo 55 + React Native + expo-router |
| 인프라 | Railway + Cloudflare R2 + FCM |

## 시작하기

```bash
cd src
pnpm install
pnpm api:dev
```

상세 명령어와 프로젝트 구조는 [CLAUDE.md](./CLAUDE.md) 참조.
