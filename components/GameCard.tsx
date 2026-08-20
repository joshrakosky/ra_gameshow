// Landing game pick: the logo is the button. Hover/tap scales it up.

"use client"

import type { ReactNode } from "react"
import Link from "next/link"

interface GameCardProps {
  href: string
  logo: ReactNode
  label: string
}

export default function GameCard({ href, logo, label }: GameCardProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex items-center justify-center p-4 transition-transform duration-200 hover:scale-125 active:scale-110"
    >
      {logo}
    </Link>
  )
}
