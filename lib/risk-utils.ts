import type { RiskLevel, RiskAssessment } from "./types"

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 4) return "low"
  if (score <= 9) return "medium"
  if (score <= 15) return "high"
  return "critical"
}

export function getRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact
}

export function computeOverallScore(risks: RiskAssessment[]): number {
  if (risks.length === 0) return 0
  const totalScore = risks.reduce((sum, r) => sum + r.score, 0)
  const maxPossible = risks.length * 25
  return Math.round((totalScore / maxPossible) * 100)
}

export function getOverallLevel(score: number): RiskLevel {
  if (score <= 20) return "low"
  if (score <= 45) return "medium"
  if (score <= 70) return "high"
  return "critical"
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "text-emerald-500"
    case "medium":
      return "text-amber-500"
    case "high":
      return "text-orange-500"
    case "critical":
      return "text-red-500"
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "bg-emerald-500/10"
    case "medium":
      return "bg-amber-500/10"
    case "high":
      return "bg-orange-500/10"
    case "critical":
      return "bg-red-500/10"
  }
}

export function getRiskBorderColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "border-emerald-500/20"
    case "medium":
      return "border-amber-500/20"
    case "high":
      return "border-orange-500/20"
    case "critical":
      return "border-red-500/20"
  }
}

export function getMatrixCellColor(likelihood: number, impact: number): string {
  const score = likelihood * impact
  if (score <= 4) return "bg-emerald-500/20 hover:bg-emerald-500/30"
  if (score <= 9) return "bg-amber-500/20 hover:bg-amber-500/30"
  if (score <= 15) return "bg-orange-500/20 hover:bg-orange-500/30"
  return "bg-red-500/20 hover:bg-red-500/30"
}

export function getMatrixCellTextColor(likelihood: number, impact: number): string {
  const score = likelihood * impact
  if (score <= 4) return "text-emerald-700 dark:text-emerald-400"
  if (score <= 9) return "text-amber-700 dark:text-amber-400"
  if (score <= 15) return "text-orange-700 dark:text-orange-400"
  return "text-red-700 dark:text-red-400"
}

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
