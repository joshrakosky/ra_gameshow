// Tiny Web Audio cues so the room hears buzz-in / correct / wrong
// without shipping audio files. Safe to call from click/key handlers.

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  return audioCtx
}

function tone(frequency: number, duration: number, type: OscillatorType = "square", volume = 0.12) {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === "suspended") void ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.value = volume
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.stop(ctx.currentTime + duration)
}

export function playBuzz() {
  tone(880, 0.12, "square", 0.14)
}

export function playLock() {
  tone(523, 0.28, "triangle", 0.16)
  setTimeout(() => tone(784, 0.22, "triangle", 0.12), 90)
}

export function playCorrect() {
  tone(523, 0.12, "sine", 0.14)
  setTimeout(() => tone(659, 0.12, "sine", 0.14), 110)
  setTimeout(() => tone(784, 0.22, "sine", 0.16), 220)
}

export function playWrong() {
  tone(196, 0.35, "sawtooth", 0.1)
}

export function playDailyDouble() {
  tone(392, 0.15, "triangle", 0.14)
  setTimeout(() => tone(523, 0.15, "triangle", 0.14), 140)
  setTimeout(() => tone(659, 0.28, "triangle", 0.16), 280)
}
