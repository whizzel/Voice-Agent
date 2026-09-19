"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type OrbProps = {
  className?: string
  getInputVolume?: () => number
  getOutputVolume?: () => number
}

// A CSS gradient orb instead of a WebGL/three.js shader: no GPU driver
// dependency, no external texture fetch, renders identically on any
// machine, including whatever the WebGL context-loss bug hit before.
export function Orb({ className, getInputVolume, getOutputVolume }: OrbProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame: number

    const tick = () => {
      const el = rootRef.current
      if (el) {
        const input = clamp01(getInputVolume?.() ?? 0)
        const output = clamp01(getOutputVolume?.() ?? 0)
        el.style.setProperty("--level", Math.max(input, output).toFixed(3))
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [getInputVolume, getOutputVolume])

  return (
    <div ref={rootRef} className={cn("orb-root", className)}>
      <div className="orb-blob orb-blob-a" />
      <div className="orb-blob orb-blob-b" />
      <div className="orb-blob orb-blob-c" />
      <div className="orb-glow" />
    </div>
  )
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}
