// Local leaderboard so players can take turns stacking money against each other.

export type LeaderboardEntry = {
  name: string
  score: number
  durationSec: number
  at: number
}

const KEY = "ra-gameshow-jeopardy-leaderboard"
const MAX_ENTRIES = 12

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LeaderboardEntry[]
    return parsed.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const next = [entry, ...loadLeaderboard()]
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, MAX_ENTRIES)
  window.localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearLeaderboard() {
  window.localStorage.removeItem(KEY)
}
