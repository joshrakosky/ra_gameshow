"use client"

import BackButton from "@/components/BackButton"
import { formatClock } from "@/lib/clock"
import type { LeaderboardEntry } from "@/lib/leaderboard"

interface WinnerViewProps {
  name: string
  score: number
  durationSec: number
  leaderboard: LeaderboardEntry[]
  runAt: number
  onNextPlayer: () => void
}

export default function WinnerView({
  name,
  score,
  durationSec,
  leaderboard,
  runAt,
  onNextPlayer,
}: WinnerViewProps) {
  const place = leaderboard.findIndex((entry) => entry.at === runAt) + 1

  return (
    <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-10 text-center">
      <BackButton />
      <p className="ra-category text-sm text-ra-gold">Round over</p>
      <h1 className="mt-2 text-4xl font-bold md:text-5xl">{name} stacked ${score}</h1>
      <p className="mt-2 text-white/70">
        {formatClock(durationSec)} round
        {place > 0 ? ` · #${place} on the board` : ""}
      </p>

      <ol className="mt-10 w-full max-w-md space-y-2">
        {leaderboard.map((entry, index) => (
          <li
            key={`${entry.name}-${entry.at}`}
            className={`grid grid-cols-3 items-center px-5 py-3 text-center text-xl ${
              entry.at === runAt ? "bg-ra-red" : "bg-white/10"
            }`}
          >
            <span className="text-white/70">{index + 1}</span>
            <span className="font-semibold">{entry.name}</span>
            <span className="font-bold">${entry.score}</span>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onNextPlayer}
          className="ra-category min-h-14 bg-ra-red px-8 text-sm text-white transition-opacity hover:opacity-80"
        >
          Next player
        </button>
      </div>
    </div>
  )
}
