"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getRiskLevel } from "@/lib/risk-utils"

interface RiskSliderProps {
  label: string
  type: "likelihood" | "impact"
  value: number
  onChange: (value: number) => void
}

const LIKELIHOOD_LABELS: Record<number, string> = {
  1: "Rare",
  2: "Unlikely",
  3: "Possible",
  4: "Likely",
  5: "Almost Certain",
}

const IMPACT_LABELS: Record<number, string> = {
  1: "Negligible",
  2: "Minor",
  3: "Moderate",
  4: "Major",
  5: "Severe",
}

function getSliderColor(value: number, type: "likelihood" | "impact"): string {
  if (value <= 1) return "text-emerald-500"
  if (value <= 2) return "text-amber-500"
  if (value <= 3) return "text-amber-500"
  if (value <= 4) return "text-orange-500"
  return "text-red-500"
}

export function RiskSlider({ label, type, value, onChange }: RiskSliderProps) {
  const labels = type === "likelihood" ? LIKELIHOOD_LABELS : IMPACT_LABELS
  const displayLabel = labels[value] || ""

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            getSliderColor(value, type)
          )}
        >
          {value} - {displayLabel}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={5}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{labels[1]}</span>
        <span>{labels[5]}</span>
      </div>
    </div>
  )
}

interface RiskScoreDisplayProps {
  likelihood: number
  impact: number
}

export function RiskScoreDisplay({ likelihood, impact }: RiskScoreDisplayProps) {
  const score = likelihood * impact
  const level = getRiskLevel(score)

  const colorMap = {
    low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    high: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    critical: "text-red-500 bg-red-500/10 border-red-500/20",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-1.5",
        colorMap[level]
      )}
    >
      <span className="text-sm font-medium">Risk Score:</span>
      <span className="text-lg font-bold tabular-nums">{score}</span>
      <span className="text-xs capitalize">({level})</span>
    </div>
  )
}
