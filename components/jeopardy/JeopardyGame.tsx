// 1-player timed Jeopardy: deal a fresh board, race the clock, host judges, then leaderboard.

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import JeopardyLogo from "@/components/JeopardyLogo"
import {
  BOARD_CATEGORY_COUNT,
  CLUE_VALUES,
  dealJeopardyBoard,
  isDailyDouble,
  pickDailyDoubles,
  type DailyDoubleCell,
  type DealtCategory,
} from "@/data/jeopardy"
import {
  clearLeaderboard,
  loadLeaderboard,
  saveLeaderboardEntry,
  type LeaderboardEntry,
} from "@/lib/leaderboard"
import { playCorrect, playDailyDouble, playWrong } from "@/lib/sounds"
import Board from "./Board"
import ClueView from "./ClueView"
import DailyDoubleWager from "./DailyDoubleWager"
import ScoreBar from "./ScoreBar"
import Setup from "./Setup"
import WinnerView from "./WinnerView"

type Phase = "setup" | "board" | "wager" | "clue" | "winner"

const emptyUsed = () => Array.from({ length: BOARD_CATEGORY_COUNT }, () => Array.from({ length: 5 }, () => false))

export default function JeopardyGame() {
  const [phase, setPhase] = useState<Phase>("setup")
  const [playerName, setPlayerName] = useState("")
  const [durationSec, setDurationSec] = useState(180)
  const [secondsLeft, setSecondsLeft] = useState(180)
  const [score, setScore] = useState(0)
  const [board, setBoard] = useState<DealtCategory[]>([])
  const [used, setUsed] = useState<boolean[][]>(emptyUsed)
  const [doubles, setDoubles] = useState<DailyDoubleCell[]>([])
  const [active, setActive] = useState<{ cat: number; val: number } | null>(null)
  const [peeked, setPeeked] = useState(false)
  const [peekPaused, setPeekPaused] = useState(false)
  const [wager, setWager] = useState(200)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [runAt, setRunAt] = useState(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLeaderboard(loadLeaderboard())
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const activeClue = active && board[active.cat] ? board[active.cat].clues[active.val] : null
  const activeValue = active ? CLUE_VALUES[active.val] : 0
  const daily = !!active && isDailyDouble(doubles, active.cat, active.val)
  const clockPaused = phase === "wager" || peekPaused
  const maxWager = Math.max(score, 1000)
  const allUsed = useMemo(() => used.every((col) => col.every(Boolean)), [used])

  const markUsed = (cat: number, val: number) => {
    setUsed((prev) => prev.map((col, i) => (i === cat ? col.map((cell, j) => (j === val ? true : cell)) : col)))
  }

  const returnToBoard = (cat: number, val: number) => {
    markUsed(cat, val)
    setPeeked(false)
    setPeekPaused(false)
    setActive(null)
    setPhase("board")
  }

  const finishRun = useCallback(
    (finalScore: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const at = Date.now()
      setRunAt(at)
      const next = saveLeaderboardEntry({
        name: playerName.trim() || "Player",
        score: finalScore,
        durationSec,
        at,
      })
      setLeaderboard(next)
      setPhase("winner")
    },
    [playerName, durationSec],
  )

  const startRound = () => {
    finishedRef.current = false
    setBoard(dealJeopardyBoard())
    setDoubles(pickDailyDoubles())
    setUsed(emptyUsed())
    setScore(0)
    setSecondsLeft(durationSec)
    setActive(null)
    setPeeked(false)
    setPeekPaused(false)
    setPhase("board")
  }

  useEffect(() => {
    if (phase !== "board" && phase !== "clue") return
    if (clockPaused) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase, clockPaused])

  useEffect(() => {
    if (secondsLeft !== 0) return
    if (clockPaused) return
    if (phase !== "board" && phase !== "clue") return
    finishRun(score)
  }, [secondsLeft, phase, clockPaused, score, finishRun])

  useEffect(() => {
    if (phase === "board" && allUsed && board.length > 0) {
      finishRun(score)
    }
  }, [allUsed, phase, board.length, score, finishRun])

  const handleSelect = (cat: number, val: number) => {
    if (secondsLeft <= 0) return
    setActive({ cat, val })
    setPeeked(false)
    setPeekPaused(false)
    if (isDailyDouble(doubles, cat, val)) {
      playDailyDouble()
      setWager(Math.min(Math.max(score, 1000), CLUE_VALUES[val]))
      setPhase("wager")
    } else {
      setPhase("clue")
    }
  }

  const handleCorrect = () => {
    if (!active) return
    const delta = daily ? wager : activeValue
    playCorrect()
    const nextScore = score + delta
    setScore(nextScore)
    returnToBoard(active.cat, active.val)
  }

  const handleWrong = () => {
    if (!active) return
    const delta = daily ? wager : activeValue
    playWrong()
    setScore(score - delta)
    returnToBoard(active.cat, active.val)
  }

  if (phase === "setup") {
    return (
      <Setup
        name={playerName}
        durationSec={durationSec}
        leaderboard={leaderboard}
        onChangeName={setPlayerName}
        onChangeDuration={(seconds) => {
          setDurationSec(seconds)
          setSecondsLeft(seconds)
        }}
        onStart={startRound}
        onClearLeaderboard={() => {
          clearLeaderboard()
          setLeaderboard([])
        }}
      />
    )
  }

  if (phase === "winner") {
    return (
      <WinnerView
        name={playerName.trim() || "Player"}
        score={score}
        durationSec={durationSec}
        leaderboard={leaderboard}
        runAt={runAt}
        onNextPlayer={() => {
          setPlayerName("")
          setPhase("setup")
        }}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col gap-3 px-3 py-3 md:px-5">
      <header className="grid grid-cols-3 items-center gap-3">
        <JeopardyLogo className="h-10 w-auto justify-self-start md:h-12" />
        <p className="ra-board-category px-2 text-center text-sm leading-tight text-ra-gold md:text-base">
          {phase === "clue" && active ? (
            <>
              {board[active.cat].name} ${daily ? wager : activeValue}
            </>
          ) : (
            "\u00a0"
          )}
        </p>
        <button
          type="button"
          onClick={() => finishRun(score)}
          className="ra-category min-h-11 justify-self-end border border-white/30 px-4 text-xs transition-colors hover:border-ra-red hover:bg-ra-red"
        >
          End round
        </button>
      </header>

      {phase === "wager" && (
        <DailyDoubleWager
          categoryName={active ? board[active.cat].name : ""}
          wager={wager}
          maxWager={maxWager}
          onChange={setWager}
          onContinue={() => setPhase("clue")}
        />
      )}

      {phase === "clue" && active && activeClue && (
        <ClueView
          clue={activeClue.clue}
          answer={activeClue.answer}
          flipped={peeked}
          onFlip={() => {
            setPeeked(true)
            setPeekPaused(true)
          }}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      )}

      {phase === "board" && board.length > 0 && <Board categories={board} used={used} onSelect={handleSelect} />}

      <ScoreBar
        name={playerName}
        score={score}
        highScore={leaderboard[0]?.score ?? 0}
        secondsLeft={secondsLeft}
        paused={clockPaused}
      />
    </div>
  )
}
