import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents: true,
  // ↑ Phase 3 prep — requires Suspense wrapping around every
  //   cookie-reading page (admin, doctor/profile, onboarding, etc.)
  //   plus a coordinated switch from revalidatePath to updateTag.
  //   Tracked separately.
};

export default nextConfig;
