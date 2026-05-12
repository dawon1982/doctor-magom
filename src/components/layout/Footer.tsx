import Link from "next/link"
import { Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐻</span>
              <span className="font-bold text-lg tracking-tight">닥터마음곰</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed word-keep max-w-xs">
              마음이 맞는 선생님을 찾을 때까지,<br />
              닥터마음곰이 도와드릴게요 :)
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.instagram.com/dr.magom.official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                aria-label="Instagram"
              >
                <span className="text-[11px] font-bold">IG</span>
              </a>
              <a
                href="mailto:contact@magom.io"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                aria-label="이메일"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">서비스</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/doctors" className="hover:text-foreground transition-colors">선생님 찾기</Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-foreground transition-colors">영상 보기</Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-foreground transition-colors">기고글</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">서비스 소개</Link>
              </li>
            </ul>
          </div>

          {/* 파트너십 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">파트너십</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://whattime.co.kr/magom/meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  의사 입점 문의
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@magom.io"
                  className="hover:text-foreground transition-colors"
                >
                  광고 문의
                </a>
              </li>
              <li>
                <a
                  href="https://drive.google.com/file/d/1Q2zpDOxXnXA35lZCyZ6WZwI_VZGZXLT0/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  홍보자료 보기
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@magom.io"
                  className="hover:text-foreground transition-colors"
                >
                  고객센터
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2024 닥터마음곰. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            contact@magom.io
          </p>
        </div>
      </div>
    </footer>
  )
}
