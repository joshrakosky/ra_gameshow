// Landing: pick timed Jeopardy or Millionaire.
// Built for iPad mirroring to a TV — large cards, one tap.

import GameCard from "@/components/GameCard"
import JeopardyLogo from "@/components/JeopardyLogo"
import MillionaireLogo from "@/components/MillionaireLogo"
import RALogo from "@/components/RALogo"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col px-6 py-8 md:px-12 md:py-10">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex justify-center">
            <RALogo className="max-h-14 max-w-[180px]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Republic Game Show</h1>
          <p className="mt-2 text-lg font-semibold text-white/80">Pick a game. Keep it fun. Host from this screen.</p>
        </header>

        <div className="flex flex-1 flex-col gap-6 md:flex-row">
          <GameCard
            href="/jeopardy"
            logo={<JeopardyLogo className="h-14 w-auto md:h-16" />}
            rules={[
              "Race a 3 or 5 minute clock.",
              "Clear as many clues as you can.",
              "Daily Doubles pause the timer.",
              "Highest stacked score wins.",
            ]}
          />
          <GameCard
            href="/millionaire"
            logo={<MillionaireLogo className="h-28 w-auto md:h-32" />}
            rules={[
              "Ten questions, harder as you climb.",
              "Use 50/50 and Ask the Room.",
              "Walk away — or go for the top prize.",
            ]}
          />
        </div>
      </div>
    </div>
  )
}
