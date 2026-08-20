// Name, score, high score, and countdown — always visible during a round.

"use client"

import { formatClock } from "@/lib/clock"

interface ScoreBarProps {
  name: string
  score: number
  highScore: number
  secondsLeft: number
  paused?: boolean
}

export default function ScoreBar({ name, score, highScore, secondsLeft, paused = false }: ScoreBarProps) {
  const urgent = !paused && secondsLeft <= 30
  const isNewHigh = score > highScore
  const displayedHigh = isNewHigh ? score : highScore

  return (
    <div className="grid grid-cols-4 gap-1">
      <div className="bg-white/10 px-3 py-3 text-center">
        <p className="truncate text-sm text-white/60">Player</p>
        <p className="text-xl font-bold">{name}</p>
      </div>
      <div className="bg-white/10 px-3 py-3 text-center">
        <p className="text-sm text-white/60">Score</p>
        <p className="text-2xl font-bold text-ra-gold">${score}</p>
      </div>
      <div className={`px-3 py-3 text-center ${isNewHigh ? "bg-ra-gold text-ra-navy" : "bg-white/10"}`}>
        <p className={`text-sm ${isNewHigh ? "text-ra-navy/70" : "text-white/60"}`}>
          {isNewHigh ? "New high" : "High score"}
        </p>
        <p className="text-2xl font-bold">${displayedHigh}</p>
      </div>
      <div className={`px-3 py-3 text-center ${paused ? "bg-ra-gold text-ra-navy" : urgent ? "bg-ra-red" : "bg-white/10"}`}>
        <p className={`text-sm ${paused ? "text-ra-navy/70" : "text-white/60"}`}>{paused ? "Paused" : "Clock"}</p>
        <p className="text-2xl font-bold tabular-nums">{formatClock(secondsLeft)}</p>
      </div>
    </div>
  )
}
