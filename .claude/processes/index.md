# 프로세스 인덱스

모든 서비스 프로젝트는 Stage 0~6 파이프라인을 따른다. 각 Stage 진입 시 해당 프로세스 문서를 먼저 읽는다.

---

## 파이프라인

| Stage | 이름 | 프로세스 | 핵심 |
|-------|------|---------|------|
| 0 | 프로젝트 셋업 | `Project_Setup_Process.md` | 대화형 셋업, 폴더 생성 |
| 1 | 사전조사 | `Research_Process.md` | 조사설계 → 4명 병렬 → 검증 → 종합 |
| 2 | 기획 | `Planning_Process.md` | Gate 1(정의) → Gate 2(기능) → Gate 3(기술) |
| 3 | **디자인** | `Design_Process/` | 시스템 → 화면 → 리뷰/핸드오프 |
| 4 | **개발** | `Development_Process/` | 준비 → 기능 개발(반복) → QA 투입 |
| 5 | **QA** | `QA_Process/` | 정적 → 통합 → 기능(API+UI+디자인) → 재검증 |
| 6 | 출시 | `Launch_Process.md` | 준비 → 배포 → 안정화 |

## 콘텐츠/마케팅

| 프로세스 | 파일 | 핵심 |
|---------|------|------|
| 콘텐츠 | `Content_Process.md` | 키워드 → 초안 → 검증 → 발행 |
| 마케팅 | `Marketing_Process.md` | GTM → 채널 → 실행 → 측정 |

## 폴더 구조 프로세스 (Stage 3, 4, 5)

긴 프로세스는 Phase별로 파일을 분리. 각 폴더의 `README.md`에 Phase 흐름이 있다.

```
Design_Process/
├── README.md                    ← 개요 + Phase 흐름 + 규칙 연결
├── Phase1_디자인시스템.md         ← 컬러 + 타이포 + 컴포넌트 정의
├── Phase2_화면디자인.md           ← 4가지 상태 + 원칙 체크 + 산출물 형식
└── Phase3_리뷰핸드오프.md         ← PO 리뷰 기준 + 핸드오프 체크리스트 + QA 연결

Development_Process/
├── README.md                    ← 개요 + Phase 흐름
├── Phase1_개발준비.md            ← 아키텍처 + 환경 + API 계약
├── Phase2_기능개발.md            ← 체크리스트 작성 + 백엔드 + 프론트 + 연동
└── Phase3_QA투입준비.md          ← Definition of Done + 최종 점검

QA_Process/
├── README.md                    ← 개요 + Phase 흐름
├── Phase1_정적검증.md            ← 빌드, 린트, 타입
├── Phase2_통합검증.md            ← 스키마↔백엔드, API 계약↔코드
├── Phase3_기능검증.md            ← API + UI 인터랙션 + 에러 + 디자인
└── Phase4_수정재검증.md          ← 버그 수정 → 재검증 → 판정
```

## 부속 문서

| 파일 | 용도 |
|------|------|
| `kits/templates/documents/QA_Checklist_Template.md` | QA 사이클마다 복사하여 사용하는 체크리스트 템플릿 |
