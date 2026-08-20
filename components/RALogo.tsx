// RA logo with a text fallback so the show still looks branded
// if RA-Logo.png has not been dropped into public/images yet.

"use client"

import { useState } from "react"

interface RALogoProps {
  className?: string
}

const FORMATS = ["png", "jpg", "svg", "webp"]

export default function RALogo({ className = "" }: RALogoProps) {
  const [formatIndex, setFormatIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    if (formatIndex < FORMATS.length - 1) {
      setFormatIndex(formatIndex + 1)
    } else {
      setImageError(true)
    }
  }

  if (imageError) {
    return (
      <p className={`text-xl font-semibold tracking-wide text-white ${className}`}>
        Republic Airways
      </p>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- logo may be png/jpg/svg/webp
    <img
      src={`/images/RA-Logo.${FORMATS[formatIndex]}`}
      alt="Republic Airways"
      className={`max-w-full ${className}`}
      onError={handleError}
    />
  )
}
