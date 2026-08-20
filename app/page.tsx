// Landing: RA wordmark plus two logo-only game buttons.

import GameCard from "@/components/GameCard"
import JeopardyLogo from "@/components/JeopardyLogo"
import MillionaireLogo from "@/components/MillionaireLogo"
import RALogo from "@/components/RALogo"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col px-6 py-8 md:px-12 md:py-10">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <header className="flex justify-center">
          <RALogo className="max-h-14 max-w-[180px]" />
        </header>

        <div className="flex flex-1 items-center justify-center gap-6 md:gap-16">
          <GameCard
            href="/jeopardy"
            label="Play Jeopardy"
            logo={<JeopardyLogo className="h-28 w-auto md:h-44" />}
          />
          <GameCard
            href="/millionaire"
            label="Play Who Wants to Be a Millionaire"
            logo={<MillionaireLogo className="h-40 w-auto md:h-56" />}
          />
        </div>
      </div>
    </div>
  )
}
