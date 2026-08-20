// Square board cells, RA-red category headers in the website LEARN MORE type style.

"use client"

import { CLUE_VALUES, type DealtCategory } from "@/data/jeopardy"

interface BoardProps {
  categories: DealtCategory[]
  used: boolean[][]
  onSelect: (categoryIndex: number, valueIndex: number) => void
}

export default function Board({ categories, used, onSelect }: BoardProps) {
  return (
    <div className="grid flex-1 grid-cols-6 gap-1">
      {categories.map((category, catIndex) => (
        <div key={category.name} className="flex flex-col gap-1">
          <div className="ra-board-category flex min-h-20 items-center justify-center bg-ra-red px-2 py-2 text-center text-sm leading-tight text-white md:text-base lg:text-lg">
            <span>
              {category.name.split(" ").map((word) => (
                <span key={word} className="block">
                  {word}
                </span>
              ))}
            </span>
          </div>
          {category.clues.map((_, valueIndex) => {
            const taken = used[catIndex][valueIndex]
            const value = CLUE_VALUES[valueIndex]
            return (
              <button
                key={value}
                type="button"
                disabled={taken}
                onClick={() => onSelect(catIndex, valueIndex)}
                className={`flex min-h-16 flex-1 items-center justify-center text-2xl font-bold transition-colors md:text-3xl ${
                  taken
                    ? "cursor-default bg-white/5 text-white/20"
                    : "bg-[#0a3d5c] text-white hover:bg-[#0d4d73]"
                }`}
              >
                {taken ? "" : `$${value}`}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
