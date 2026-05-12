import { getSessionUser } from "@/lib/auth/dal"
import { HeaderNav } from "./HeaderNav"

export async function Header() {
  const user = await getSessionUser()
  return (
    <HeaderNav
      user={
        user
          ? {
              email: user.email,
              displayName: user.displayName,
              role: user.role,
            }
          : null
      }
    />
  )
}
