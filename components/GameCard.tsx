// Landing card: logo, bold rule bullets, RA-red outline. No player pills.

"use client"

import type { ReactNode } from "react"
import Link from "next/link"

interface GameCardProps {
  href: string
  logo: ReactNode
  rules: string[]
}

export default function GameCard({ href, logo, rules }: GameCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[280px] flex-1 flex-col justify-between border-2 border-ra-red bg-white/10 p-8 transition-transform duration-200 hover:scale-[1.02] hover:bg-white/15"
    >
      <div>
        <div className="mb-6 flex justify-center">{logo}</div>
        <ul className="space-y-3 text-left">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-3 text-lg font-bold leading-snug text-white">
              <span className="mt-1.5 h-2 w-2 shrink-0 bg-ra-red" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-8 text-center text-lg font-bold text-white group-hover:underline">Tap to play →</p>
    </Link>
  )
}
