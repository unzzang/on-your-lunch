# 플레이리스트 상세 화면 디자인 프롬프트

> 원본: `.docs/planning/screen/02_playlist-detail.md`
> 대상 도구: Figma AI / Google Stitch
> 마지막 업데이트: 2026-03-29

---

```
Mobile study planner app. Dark theme (#121212 background).
Spotify playlist detail page 1:1 benchmark. iPhone screen.

Playlist detail screen layout (top to bottom):

1. Navigation bar: Semi-transparent blur background.
   Left: "‹" back arrow. Right: "···" more menu.
   Title appears on scroll.

2. Hero section (center-aligned):
   - Large square cover image (240x240px), centered, with drop shadow
   - Background: Gradient from cover image dominant color fading to #121212
   - Title: "수능 국어 3시간 루틴" (24px bold, white)
   - Creator: "PACE 공식" (14px, #B3B3B3)
   - Meta: "3시간 · 세션 7개 · 342회 재생" (12px, #6A6A6A)

3. Action bar (horizontal row):
   - Large green circular play button (56px, #1DB954) — most prominent
   - Heart icon (like)
   - Download icon (save)
   - "···" more menu
   - No shuffle button

4. Description:
   "비문학 + 문학 + 화법과 작문을 3시간 안에 소화하는 집중 루틴"
   (14px, #B3B3B3, max 2 lines with "더보기")

5. Track list (session list) — this is the main content:
   Each row: track number | session type icon | session title | duration

   1  📘  비문학 독해 집중      50분
   2  ☕  휴식                  10분
   3  📗  현대 문학 감상         50분
   4  ☕  휴식                  10분
   5  📙  화법과 작문 풀이       40분
   6  🍽  점심 휴식             60분
   7  📘  국어 오답 노트 정리    30분

   Study sessions: white text on dark row (#1A1A1A)
   Break sessions: slightly different bg (#1A2A1A), green-tinted icon
   Each row has subtle bottom border (#2A2A2A)

6. Bottom recommendation: "이건 어떠신가요?" header,
   2-3 horizontal scroll playlist cards

7. Bottom fixed: Mini player bar + tab navigation

Style: Spotify playlist detail page.
Hero gradient is the key visual element.
Cover image should have prominent shadow.
Font: DM Sans. Colors: White #F0F2F5 primary, #8B90A0 secondary, #4A90D9 accent.
Green play button #1DB954 is the only bright color element.
```
