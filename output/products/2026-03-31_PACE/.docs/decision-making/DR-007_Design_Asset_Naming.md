# DR-007: 디자인 산출물 네이밍 규칙

> 결정일: 2026-03-16
> 참여: PO, 위더

## 결정 사항

### `.pen` 원본 파일 네이밍

```
pace-{플랫폼}-{화면명}.pen
```

| 플랫폼 | 접두어 | 예시 |
|---|---|---|
| 모바일 앱 | `app` | `pace-app-home.pen` |
| PC 웹 | `web` | `pace-web-home.pen` |
| 관리자 웹 | `admin` | `pace-admin-dashboard.pen` |
| 공통 (디자인 시스템) | `ds` | `pace-ds-guide.pen` |
| 테스트/실험 | `test` | `pace-test-{설명}.pen` |

### 이미지 내보내기 (`design/images/`)

```
{.pen 파일명}_v{버전}.png
```

예: `pace-app-home_v1.png`, `pace-app-home_v2.png`

### 규칙

- 모든 파일명은 **소문자 + 하이픈(kebab-case)**
- 버전은 이미지 내보내기에만 적용 (`.pen` 파일은 항상 최신 유지)
- `design/` 폴더에 통합 관리

### 저장 프로세스

디자인 완료 시 위더가 PO에게 파일명을 전달 → PO가 VSCode에서 직접 저장

## 배경

Pencil MCP 기반 디자인 작업이 본격화됨에 따라, 산출물의 일관된 관리가 필요해짐.
