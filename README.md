# 닥터마음곰 (doctor-magom)

정신건강의학과 전문의 찾기 플랫폼 — 의사 디렉터리, 영상/기고글, AI 매칭.

- 서비스: <https://doctor-magom.vercel.app>
- 스택: Next.js 16 · Supabase · Tailwind CSS · shadcn/ui · Anthropic SDK
- 인증: Supabase Auth (3-role: 환자 / 의사 / 관리자)

진행 현황은 [`STATUS.md`](./STATUS.md) 참고.

---

## 다른 기기에서 처음 시작할 때

```bash
# 1. clone
git clone https://github.com/dawon1982/doctor-magom.git
cd doctor-magom

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 열어서 Supabase URL·키, Anthropic API 키 등 채우기
# (실제 값은 Vercel 대시보드 환경변수 또는 Supabase 프로젝트 설정에서 복사)

# 4. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

> `.env.local`은 git에 올라가지 않습니다 (`.gitignore`의 `.env*` 패턴으로 차단).  
> 비밀값의 정본은 Vercel 환경변수 대시보드.

---

## 환경변수

| 키 | 설명 | 필수 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 (서버 전용) | ✓ |
| `ANTHROPIC_API_KEY` | AI 프로필 생성·환자 매칭용 | ✓ |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway (선택) | — |
| `RESEND_API_KEY` | 이메일 발송 (도메인 활성화 후) | — |
| `RESEND_FROM` | 발신 이메일 주소 | — |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (로컬: `http://localhost:3000`) | ✓ |

---

## 일상 작업 사이클

**작업 시작**

```bash
git checkout main
git pull origin main      # 최신본 받기
git checkout -b feature/오늘-할-일
```

**작업 종료 — 자리 뜨기 전 반드시 push**

```bash
git add -A
git commit -m "feat: 변경 내용 요약"
git push -u origin feature/오늘-할-일
```

다음에 다른 기기에서 이어 작업:

```bash
git fetch
git checkout feature/오늘-할-일
git pull
```

---

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint |

---

## 배포

`main` 브랜치 push 시 Vercel이 자동 배포합니다.  
내부 작업 지침은 [`AGENTS.md`](./AGENTS.md) 참고.
