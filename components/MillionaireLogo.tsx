// Circular Millionaire emblem — transparent PNG, no blend needed.

"use client"

interface MillionaireLogoProps {
  className?: string
}

export default function MillionaireLogo({ className = "" }: MillionaireLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset
    <img
      src="/images/millionaire-logo.png"
      alt="Who Wants to Be a Millionaire"
      className={`h-auto max-w-full rounded-full object-contain ${className}`}
    />
  )
}
