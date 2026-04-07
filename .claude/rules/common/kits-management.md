# kits/ 템플릿 및 첨부 파일 관리 규칙

## 역할

`kits/`는 **재사용 가능한 템플릿과 외부 참고 파일**을 보관하는 공간이다.

## 폴더 구조

```
kits/
├── templates/           ← 템플릿
│   ├── product/           프로젝트 스타터 킷 (clone해서 사용)
│   └── documents/         문서 템플릿 (복사해서 사용)
│       ├── meeting-note.md
│       ├── decision-record.md
│       └── effort-card.md
└── attachments/         ← 외부 참고 파일
```

## templates/ 사용법

- `product/` — 새 서비스 프로젝트 시작 시 clone
- `documents/meeting-note.md` — 회사 회의록 작성 시 복사
- `documents/decision-record.md` — 회사 DR 작성 시 복사
- `documents/effort-card.md` — 새 프로젝트 카드 생성 시 복사하여 `efforts/001_On/`에 배치

## attachments/ 사용법

마크다운으로 정리할 수 없는 **외부 원본 자료**를 보관한다.

| 대상 | 예시 |
|------|------|
| PDF | 시장조사 보고서, 논문, 사업계획서 원본 |
| 이미지 | 경쟁사 스크린샷, 벤치마크 캡처, 참고 디자인 |
| 문서 | 외부에서 받은 엑셀, PPT 등 |

### 파일 정리 규칙

- 파일명: `{날짜}_{설명}.{확장자}` (예: `2026-04-01_경쟁사A_앱스크린샷.png`)
- 관련 프로젝트가 있으면 프로젝트명 접두어: `{프로젝트명}_{설명}.{확장자}`
- 용량이 큰 파일(50MB 이상)은 외부 클라우드(Google Drive 등)에 저장하고 링크만 남김
