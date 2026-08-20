// Decorative planes that drift across the navy background.
// Pointer-events none so they never block taps on iPad.

"use client"

function Plane({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function FlyingPlanes() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute text-white opacity-20"
        style={{ top: "0%", left: "-50px", animation: "flyBounce1 28s ease-in-out infinite" }}
      >
        <Plane size={40} />
      </div>
      <div
        className="absolute text-white opacity-15"
        style={{ top: "35%", right: "-50px", animation: "flyBounce2 22s ease-in-out infinite", animationDelay: "2s" }}
      >
        <Plane size={35} />
      </div>
      <div
        className="absolute text-white opacity-25"
        style={{ bottom: "0%", left: "-50px", animation: "flyBounce3 20s ease-in-out infinite", animationDelay: "4s" }}
      >
        <Plane size={30} />
      </div>
      <div
        className="absolute text-white opacity-20"
        style={{ top: "0%", right: "-50px", animation: "flyBounce4 26s ease-in-out infinite", animationDelay: "1s" }}
      >
        <Plane size={38} />
      </div>
      <div
        className="absolute text-white opacity-15"
        style={{ bottom: "0%", right: "-50px", animation: "flyBounce5 24s ease-in-out infinite", animationDelay: "3s" }}
      >
        <Plane size={32} />
      </div>
    </div>
  )
}
