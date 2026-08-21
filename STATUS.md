---
name: 닥터마음곰
description: 정신건강의학과 의사-환자 매칭 플랫폼 (정신과계 강남언니, 의사 15명)
status: active
progress: 86
updated: 2026-08-19
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
- [x] 보안 강화 + AI rate limit + 이미지 최적화 + 클릭 추적 + 다크모드 (2026-06-12)
- [x] Supabase free-tier 자동 일시정지 방지 — daily keepalive cron (2026-06-22)
- [x] 다축 개선 감사 + P1/P2 일괄 조치 + 배포 (2026-07-31)
- [x] 마이그레이션 013 적용 (doctors.phone·naver_booking_url 추가 + match_queries anon INSERT 정책 제거) (2026-07-31)
- [x] Vercel 환경변수 CRON_SECRET 설정 (2026-07-31)
- [ ] AI 매칭 재활성 — Vercel이 무료 크레딧에서 Claude 차단(2026-08). 결제 경로(Vercel 크레딧 충전 또는 Anthropic 직접 키) 결정 후 `src/lib/flags.ts`의 AI_MATCH_ENABLED를 true로 + 배포
- [ ] 의사별 전화번호·네이버 예약 URL 실제 값 입력 (컬럼·관리자 입력폼은 준비 완료)
- [ ] magom.io 도메인 재구입 + Resend 활성화
- [ ] Google OAuth 추가 검토
- [ ] Phase 4 — Q&A 게시판 / 커뮤니티 / 광고 슬롯

# 개발 로그

## 2026-08-19

- AI 매칭 403 장애 원인 확인: Vercel AI Gateway가 무료 크레딧 사용자에게 Claude 모델 접근을 차단(정책 변경). 무료로 남은 모델은 매칭 품질·개인정보(중국 제공사 전송) 우려로 채택하지 않기로 결정.
- AI 추천 일시 비활성 처리: /match는 안내 화면으로 전환(위기상담 안내 유지), 홈·메뉴·소개 페이지의 AI 진입점도 함께 정리. 에러 원문(내부 메타데이터)이 사용자 화면에 그대로 노출되던 문제도 수정.

## 2026-07-31

- 전 영역 개선 감사(보안·UI/UX·기능·SEO·사업성) 후 P1/P2 일괄 조치.
- 치명 5건 처리: 후기 본문을 통한 저장형 XSS 차단, 자살예방상담 109·1577-0199 안내 신설, 근거 없던 "후기 28명" 수치 제거(진료 스타일 키워드로 정정), 개인정보처리방침·이용약관 페이지 신설 + 매칭 화면의 잘못된 "저장 안 함" 고지 정정, AI 매칭 rate limit 우회 경로 차단.
- 전환 경로 보강: 전화·네이버 예약 컬럼과 CTA 추가, 연락처가 없는 선생님에게도 대체 경로 제공, 모바일 하단 고정 예약 바.
- 안정성·품질: 에러·404·로딩 화면 신설, 관리자 표가 모바일에서 잘리던 문제 해결, 다크모드 대비 개선, 진료시간 파서의 공휴일·괄호·요일 오판 수정, 보안 헤더 추가, 프로덕션 취약점 12건 → 3건.

## 2026-06-22

- Supabase free-tier 자동 일시정지로 의사 데이터 조회 끊김 → DB 복원 + daily keepalive cron 신설(재발 방지)
- 마이그레이션 009~012 전부 적용 확인, 임시 debug 라우트 정리

## 2026-06-12

- 보안 강화 + AI 매칭 rate limit + 이미지 최적화 + 클릭 추적 + 다크모드 일괄

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
