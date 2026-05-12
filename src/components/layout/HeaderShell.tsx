import { HeaderNav } from "./HeaderNav"

/**
 * Static Suspense fallback for the session-aware <Header />.
 * Renders the logged-out view (login / signup buttons) so the static
 * shell is fully prerendered. Once cookies resolve server-side, the
 * real <Header /> streams in and replaces this skeleton — the visual
 * delta is just the user menu vs the login/signup buttons.
 */
export function HeaderShell() {
  return <HeaderNav user={null} />
}
