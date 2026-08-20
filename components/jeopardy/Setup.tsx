// 1-player setup: name, 3 or 5 minute clock, plus the running leaderboard.

"use client"

import BackButton from "@/components/BackButton"
import JeopardyLogo from "@/components/JeopardyLogo"
import type { LeaderboardEntry } from "@/lib/leaderboard"

interface SetupProps {
  name: string
  durationSec: number
  leaderboard: LeaderboardEntry[]
  onChangeName: (name: string) => void
  onChangeDuration: (seconds: number) => void
  onStart: () => void
  onClearLeaderboard: () => void
}

export default function Setup({
  name,
  durationSec,
  leaderboard,
  onChangeName,
  onChangeDuration,
  onStart,
  onClearLeaderboard,
}: SetupProps) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-8 text-center">
      <BackButton />
      {leaderboard.length > 0 && (
        <button
          type="button"
          onClick={onClearLeaderboard}
          className="ra-category fixed right-4 top-4 z-20 min-h-12 border border-white/30 px-4 text-xs text-white transition-colors hover:border-ra-red hover:bg-ra-red"
        >
          Clear leaderboard
        </button>
      )}

      <JeopardyLogo className="h-20 w-auto md:h-24" />

      <label className="mt-10 w-full max-w-md text-center">
        <span className="ra-board-category text-sm text-white">Player name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="mt-2 w-full border-0 border-b-2 border-white/30 bg-white/10 px-4 py-3 text-center text-2xl font-semibold text-white outline-none focus:border-white/30"
          style={{ color: "#ffffff" }}
          maxLength={18}
        />
      </label>

      <div className="mt-8 w-full max-w-md">
        <p className="ra-board-category mb-3 text-sm text-white">Round length</p>
        <div className="flex gap-3">
          {[180, 300].map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onChangeDuration(seconds)}
              className={`ra-board-category min-h-16 flex-1 px-4 text-base transition-colors md:text-lg ${
                durationSec === seconds
                  ? "bg-ra-red text-white"
                  : "bg-white/10 text-white hover:bg-[#0d4d73]"
              }`}
            >
              {seconds === 180 ? "3 Min" : "5 Min"}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!name.trim()}
        onClick={onStart}
        className="ra-category mt-10 min-h-14 bg-ra-red px-12 text-sm text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
      >
        Start round
      </button>

      <div className="mt-12 w-full">
        <h2 className="ra-board-category mb-4 text-lg text-white">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-white/50">No scores yet — first player sets the bar.</p>
        ) : (
          <ol className="mx-auto max-w-md space-y-2">
            {leaderboard.map((entry, index) => (
              <li
                key={`${entry.name}-${entry.at}`}
                className="grid grid-cols-3 items-center bg-white/10 px-4 py-3 text-center"
              >
                <span className="text-white/60">{index + 1}</span>
                <span className="font-semibold">{entry.name}</span>
                <span className="font-bold text-ra-gold">${entry.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
