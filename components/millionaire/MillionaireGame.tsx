// One-player ladder. Host/contestant taps an answer; you can walk away, 50/50, or Ask the Room.

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import MillionaireLogo from "@/components/MillionaireLogo"
import {
  dealMillionaireRound,
  MILLIONAIRE_PRIZES,
  SAFETY_NET_INDEX,
  type MillionaireQuestion,
} from "@/data/millionaire"
import { playCorrect, playWrong } from "@/lib/sounds"

type Phase = "setup" | "play" | "askRoom" | "result"

type ResultKind = "win" | "walk" | "miss"

const LETTERS = ["A", "B", "C", "D"] as const

export default function MillionaireGame() {
  const [phase, setPhase] = useState<Phase>("setup")
  const [name, setName] = useState("Contestant")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [hiddenChoices, setHiddenChoices] = useState<number[]>([])
  const [usedFifty, setUsedFifty] = useState(false)
  const [usedAskRoom, setUsedAskRoom] = useState(false)
  const [resultKind, setResultKind] = useState<ResultKind>("win")
  const [lockedPrizeIndex, setLockedPrizeIndex] = useState<number | null>(null)
  const [questions, setQuestions] = useState<MillionaireQuestion[]>([])

  const question = questions[questionIndex]

  const prizeWonLabel = useMemo(() => {
    if (lockedPrizeIndex === null) return "Thanks for playing"
    return MILLIONAIRE_PRIZES[lockedPrizeIndex].label
  }, [lockedPrizeIndex])

  const resetRound = () => {
    setSelected(null)
    setHiddenChoices([])
  }

  const startGame = () => {
    setQuestions(dealMillionaireRound())
    setQuestionIndex(0)
    setUsedFifty(false)
    setUsedAskRoom(false)
    setLockedPrizeIndex(null)
    resetRound()
    setPhase("play")
  }

  const applyFiftyFifty = () => {
    if (usedFifty || !question) return
    const wrong = [0, 1, 2, 3].filter((i) => i !== question.correctIndex)
    const shuffled = [...wrong].sort(() => Math.random() - 0.5)
    setHiddenChoices(shuffled.slice(0, 2))
    setUsedFifty(true)
    if (selected !== null && shuffled.slice(0, 2).includes(selected)) {
      setSelected(null)
    }
  }

  const lockIn = () => {
    if (selected === null || !question) return
    if (selected === question.correctIndex) {
      playCorrect()
      const nextIndex = questionIndex + 1
      if (nextIndex >= questions.length) {
        setLockedPrizeIndex(MILLIONAIRE_PRIZES.length - 1)
        setResultKind("win")
        setPhase("result")
        return
      }
      setLockedPrizeIndex(questionIndex)
      setQuestionIndex(nextIndex)
      resetRound()
      return
    }

    playWrong()
    const safetyReached = questionIndex > SAFETY_NET_INDEX
    setLockedPrizeIndex(safetyReached ? SAFETY_NET_INDEX : null)
    setResultKind("miss")
    setPhase("result")
  }

  const walkAway = () => {
    setResultKind("walk")
    setPhase("result")
  }

  if (phase === "setup") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-8 text-center">
        <MillionaireLogo className="h-28 w-auto md:h-36" />

        <label className="mt-8 w-full rounded-2xl bg-white p-4 text-left">
          <span className="text-sm font-medium text-gray-600">Contestant name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-xl font-semibold"
            maxLength={24}
          />
        </label>
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={startGame}
            disabled={!name.trim()}
            className="min-h-14 rounded-xl bg-ra-red px-8 text-lg font-semibold disabled:opacity-40"
          >
            Let’s play
          </button>
          <Link href="/" className="text-white/70 underline-offset-4 hover:underline">
            Back to games
          </Link>
        </div>
      </div>
    )
  }

  if (phase === "result") {
    const headline =
      resultKind === "win"
        ? `${name} takes the top prize!`
        : resultKind === "walk"
          ? `${name} walks away`
          : `${name} is done flying`

    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-ra-gold">Prize reveal</p>
        <h1 className="mt-2 text-4xl font-bold">{headline}</h1>
        <p className="mt-8 rounded-3xl bg-white/10 px-8 py-10 text-3xl font-semibold text-ra-gold">
          {prizeWonLabel}
        </p>
        <p className="mt-4 text-white/60">Placeholder prize — swap in a real offer later.</p>
        <div className="mt-10 flex gap-6">
          <button
            type="button"
            onClick={() => {
              setName("Contestant")
              setPhase("setup")
            }}
            className="min-h-14 rounded-xl bg-ra-red px-8 text-lg font-semibold"
          >
            Play again
          </button>
          <Link href="/" className="flex min-h-14 items-center text-white/70 underline-offset-4 hover:underline">
            Back to games
          </Link>
        </div>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="flex min-h-screen flex-col gap-4 px-4 py-4 md:flex-row md:px-6">
      <div className="flex flex-1 flex-col">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">{name}</h1>
        </header>

        <div className="flex flex-1 flex-col rounded-3xl bg-[#0a3d5c] p-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-ra-gold">
            Question {questionIndex + 1} of {questions.length}
          </p>
          <p className="mt-4 text-2xl font-semibold leading-snug md:text-4xl">{question.prompt}</p>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
            {question.choices.map((choice, index) => {
              const hidden = hiddenChoices.includes(index)
              const isSelected = selected === index
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={hidden || phase === "askRoom"}
                  onClick={() => setSelected(index)}
                  className={`min-h-16 rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold disabled:opacity-20 ${
                    isSelected ? "border-ra-gold bg-ra-gold/20" : "border-white/20 bg-white/5"
                  }`}
                >
                  <span className="mr-3 text-ra-gold">{LETTERS[index]}:</span>
                  {choice}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={applyFiftyFifty}
            disabled={usedFifty || phase === "askRoom"}
            className="min-h-12 rounded-xl border border-white/30 px-4 font-semibold disabled:opacity-30"
          >
            50 / 50
          </button>
          <button
            type="button"
            onClick={() => {
              setUsedAskRoom(true)
              setPhase("askRoom")
            }}
            disabled={usedAskRoom || phase === "askRoom"}
            className="min-h-12 rounded-xl border border-white/30 px-4 font-semibold disabled:opacity-30"
          >
            Ask the Room
          </button>
          <button
            type="button"
            onClick={walkAway}
            className="min-h-12 rounded-xl border border-white/30 px-4 font-semibold"
          >
            Walk away
          </button>
          <button
            type="button"
            disabled={selected === null || phase === "askRoom"}
            onClick={lockIn}
            className="min-h-12 rounded-xl bg-ra-red px-6 font-semibold disabled:opacity-40"
          >
            Lock in
          </button>
        </div>
      </div>

      <aside className="w-full md:w-64">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/50">Prize ladder</p>
        <ol className="flex flex-col-reverse gap-1">
          {MILLIONAIRE_PRIZES.map((prize, index) => {
            const isCurrent = index === questionIndex
            const isWon = lockedPrizeIndex !== null && index <= lockedPrizeIndex
            return (
              <li
                key={prize.label}
                className={`rounded-lg px-3 py-2 text-sm ${
                  isCurrent ? "animate-ladder-glow bg-ra-gold font-bold text-ra-navy" : isWon ? "bg-white/15" : "bg-white/5 text-white/70"
                }`}
              >
                {index + 1}. {prize.label}
                {prize.isSafetyNet ? " · safe" : ""}
              </li>
            )
          })}
        </ol>
      </aside>

      {phase === "askRoom" && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-6">
          <div className="max-w-lg rounded-3xl bg-ra-navy p-8 text-center ring-2 ring-ra-gold">
            <h2 className="text-3xl font-bold">Ask the Room</h2>
            <p className="mt-4 text-lg text-white/80">
              Audience — shout it out or raise your hands. Host, tap continue when you’re ready.
            </p>
            <button
              type="button"
              onClick={() => setPhase("play")}
              className="mt-8 min-h-14 rounded-xl bg-ra-gold px-8 text-lg font-bold text-ra-navy"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
