// Host-judged clue. Answer flips the card; category and value live in the game header.

"use client"

interface ClueViewProps {
  clue: string
  answer: string
  flipped: boolean
  onFlip: () => void
  onCorrect: () => void
  onWrong: () => void
}

export default function ClueView({ clue, answer, flipped, onFlip, onCorrect, onWrong }: ClueViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="clue-scene relative min-h-[42vh] flex-1">
        <div className={`clue-card ${flipped ? "is-flipped" : ""}`}>
          <div className="clue-face">
            <p className="max-w-4xl text-3xl font-semibold leading-snug md:text-5xl">{clue}</p>
          </div>
          <div className="clue-face clue-face-back">
            <p className="max-w-4xl text-3xl font-semibold leading-snug text-ra-gold md:text-5xl">{answer}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {!flipped ? (
          <button
            type="button"
            onClick={onFlip}
            className="ra-category min-h-14 border border-white/30 px-6 text-sm transition-colors hover:border-[#0d4d73] hover:bg-[#0d4d73]"
          >
            Answer
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onCorrect}
              className="ra-category min-h-14 bg-emerald-500 px-8 text-sm text-white transition-opacity hover:opacity-80"
            >
              Correct
            </button>
            <button
              type="button"
              onClick={onWrong}
              className="ra-category min-h-14 bg-ra-red px-8 text-sm text-white transition-opacity hover:opacity-80"
            >
              Wrong
            </button>
          </>
        )}
      </div>
    </div>
  )
}
