---
name: 닥터마음곰
description: 정신건강의학과 의사-환자 매칭 플랫폼 (정신과계 강남언니, 의사 15명)
status: active
progress: 78
updated: 2026-05-30
tags: [nextjs, vercel, supabase, ai]
---

# 마일스톤

- [x] Phase 1 — 정적 페이지 (홈/의사목록/상세/영상/기고글/about)
- [x] Phase 1.5 — Vercel 배포 (doctor-magom.vercel.app)
- [x] Phase 2 — Supabase + 3-role 인증 + 관리자 대시보드 + 입점 신청
- [x] Phase 2 — Resend wrapper (dry-run, 도메인 대기)
- [x] Phase 2 — cacheComponents 활성 + PPR + 정적 fallback 제거
- [x] SEO 기초 — sitemap/robots/OG/JSON-LD
- [x] Phase 3 — AI 프로필 자동생성 + YouTube RSS 수집 + 환자-의사 매칭 (/match)
- [x] Phase 3 — 의사 셀프 업로드 포탈
- [x] Patient features — 진료시간/비교/자동완성/즐겨찾기/리뷰
- [x] Phase A — 매칭 분석 대시보드 (/admin/match-queries)
- [x] Vercel 계정 이전 — scanme → leedawon82-7956 (orgId team_RAgM3gz... + auto-deploy webhook 검증)
- [x] admin 편집 페이지 — publish 토글 라벨 명확화 + 의사 삭제 버튼
- [ ] magom.io 도메인 재구입 + Resend 활성화
- [ ] Google OAuth 추가 검토
- [ ] Phase 4 — Q&A 게시판 / 커뮤니티 / 광고 슬롯

# 개발 로그

## 2026-05-30

- admin/doctors 편집 페이지: publish 토글 라벨 명확화 + 삭제 버튼 추가

## 2026-05-28

- README 전면 갱신 + `.env.local.example` 추가 (gitignore 예외 처리)

## 2026-05-27

- STATUS.md를 git 추적에 포함 (진행 상황 추적)

## 2026-05-26

- Vercel 계정 이전 — scanme → leedawon82-7956 (GitHub 리포 import 방식)
- `.vercel/repo.json` 신규 생성, orgId `team_RAgM3gz...`로 변경
- auto-deploy webhook 동작 검증 커밋 (`test: verify Vercel auto-deploy webhook`)

## 2026-05-25

- STATUS.md 초기화 (메모리 + git log 기반 추정, 검증 필요)

## 2026-05-16

- ui 다듬기: 홈/영상 모바일 단일 컬럼

## 2026-05-14

- 검색 UX: 서울 지역 그룹 필터 + AI 자동완성 힌트

## 2026-05-13

- Phase 2/3 대규모 완료 — Supabase + 인증 + 관리자 + AI 자동화 + 환자 기능 + 매칭 분석
