import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types"
import { getRiskColor, getRiskBgColor, getRiskBorderColor } from "@/lib/risk-utils"

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        getRiskColor(level),
        getRiskBgColor(level),
        getRiskBorderColor(level),
        className
      )}
    >
      {level}
    </span>
  )
}
