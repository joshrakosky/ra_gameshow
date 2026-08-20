// Simple back chevron to the landing page. Used on setup instead of “Back to games” text.

import Link from "next/link"

export default function BackButton() {
  return (
    <Link
      href="/"
      aria-label="Back to games"
      className="fixed left-4 top-4 z-20 flex h-12 w-12 items-center justify-center border border-white/30 text-white transition-colors hover:border-ra-red hover:bg-ra-red"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    </Link>
  )
}
