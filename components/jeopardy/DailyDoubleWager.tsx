// Daily Double wager. Type any amount up to the max, or tap a preset.

"use client"

interface DailyDoubleWagerProps {
  categoryName: string
  wager: number
  maxWager: number
  onChange: (value: number) => void
  onContinue: () => void
}

export default function DailyDoubleWager({
  categoryName,
  wager,
  maxWager,
  onChange,
  onContinue,
}: DailyDoubleWagerProps) {
  const presets = Array.from(new Set([200, 500, 1000, maxWager])).filter((n) => n <= maxWager)

  const setFromText = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "")
    if (digits === "") {
      onChange(0)
      return
    }
    onChange(Math.min(Number(digits), maxWager))
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
      <p className="ra-category text-sm text-ra-gold">Daily Double</p>
      <p className="ra-board-category mt-4 bg-ra-red px-6 py-3 text-xl text-white md:text-2xl">{categoryName}</p>
      <p className="mt-6 text-xl text-white">Wager up to ${maxWager}.</p>

      <div className="mt-8 flex items-center justify-center">
        <span className="text-5xl font-bold text-ra-gold md:text-6xl">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={wager === 0 ? "" : String(wager)}
          onChange={(e) => setFromText(e.target.value)}
          className="w-48 border-0 bg-transparent text-center text-5xl font-bold outline-none md:w-56 md:text-6xl"
          style={{ color: "#f5c542" }}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {presets.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(amount)}
            className="min-h-12 bg-white/10 px-5 text-lg font-semibold transition-colors hover:bg-[#0d4d73]"
          >
            ${amount}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="ra-category mt-10 min-h-14 bg-ra-gold px-10 text-sm text-ra-navy transition-opacity hover:opacity-80"
      >
        Show the clue
      </button>
    </div>
  )
}
