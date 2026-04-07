# QA 프로세스 (Stage 5)

> 적용 범위: 개발 완료된 기능의 품질 검증
> 책임자: 진도준 (QA 최종 판정권)
> 선행 조건: Stage 4 Phase 3 Definition of Done 충족

## 역할

개발 산출물이 기능 명세서와 일치하는지, 안정적으로 동작하는지 검증한다. 진도준이 Pass/Fail 최종 판정권을 갖는다.

## Phase 흐름

```
Phase 1. 정적 검증      → Phase1_정적검증.md
    ↓
Phase 2. 통합 검증      → Phase2_통합검증.md
    ↓
Phase 3. 기능 검증      → Phase3_기능검증.md
    ↓
Phase 4. 수정 재검증    → Phase4_수정재검증.md
```

## Stage 5 완료 기준

- [ ] Phase 1~3 전체 통과
- [ ] Critical/Major 버그 0건
- [ ] 진도준 최종 판정: Pass
- [ ] QA 체크리스트 완료본 저장 (`docs/004_planning/qa/`)

## 판정 기준

| 판정 | 조건 |
|------|------|
| **통과** | 상 0건 + 중 0건 |
| **조건부 통과** | 상 0건 + 중 3건 이하 |
| **실패** | 상 1건 이상, 또는 중 4건 이상 |

## 부속 문서

- `kits/templates/documents/QA_Checklist_Template.md` — QA 사이클마다 복사하여 사용
