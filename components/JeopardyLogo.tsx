// Official Jeopardy wordmark. Black in the PNG is screened out on the navy UI.

"use client"

interface JeopardyLogoProps {
  className?: string
}

export default function JeopardyLogo({ className = "" }: JeopardyLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset
    <img
      src="/images/jeopardy-logo.png"
      alt="Jeopardy"
      className={`h-auto max-w-full object-contain mix-blend-screen ${className}`}
    />
  )
}
