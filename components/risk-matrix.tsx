"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { RiskAssessment } from "@/lib/types"
import { getMatrixCellColor, getMatrixCellTextColor } from "@/lib/risk-utils"
import { LIKELIHOOD_LABELS, IMPACT_LABELS } from "@/lib/types"

interface RiskMatrixProps {
  risks: RiskAssessment[]
  compact?: boolean
}

export function RiskMatrix({ risks, compact = false }: RiskMatrixProps) {
  const cellSize = compact ? "h-10 w-10 md:h-12 md:w-12" : "h-12 w-12 md:h-16 md:w-16"
  const fontSize = compact ? "text-[10px]" : "text-xs"

  // Group risks by their position
  const riskMap: Record<string, RiskAssessment[]> = {}
  for (const r of risks) {
    const key = `${r.likelihood}-${r.impact}`
    if (!riskMap[key]) riskMap[key] = []
    riskMap[key].push(r)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-1">
          {/* Y-axis label */}
          <div className="flex flex-col items-center justify-center">
            <span
              className={cn(
                "mb-1 text-muted-foreground font-medium",
                compact ? "text-[9px]" : "text-[10px]"
              )}
              style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
            >
              LIKELIHOOD
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {/* Grid rows (5 to 1 for likelihood) */}
            {[5, 4, 3, 2, 1].map((likelihood) => (
              <div key={likelihood} className="flex items-center gap-1">
                {/* Y-axis tick */}
                <div
                  className={cn(
                    "flex items-center justify-end pr-1 text-muted-foreground",
                    compact ? "w-8 text-[9px]" : "w-16 text-[10px]"
                  )}
                >
                  <span className="truncate">
                    {compact ? likelihood : LIKELIHOOD_LABELS[likelihood]}
                  </span>
                </div>

                {/* Row cells */}
                {[1, 2, 3, 4, 5].map((impact) => {
                  const key = `${likelihood}-${impact}`
                  const cellRisks = riskMap[key] || []
                  const score = likelihood * impact

                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "relative flex items-center justify-center rounded-md border border-transparent transition-all",
                            cellSize,
                            getMatrixCellColor(likelihood, impact),
                            cellRisks.length > 0 && "ring-2 ring-foreground/20"
                          )}
                        >
                          <span
                            className={cn(
                              "font-bold tabular-nums",
                              fontSize,
                              getMatrixCellTextColor(likelihood, impact)
                            )}
                          >
                            {score}
                          </span>
                          {cellRisks.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[9px] font-bold">
                              {cellRisks.length}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">
                            Score: {score} ({LIKELIHOOD_LABELS[likelihood]} x{" "}
                            {IMPACT_LABELS[impact]})
                          </p>
                          {cellRisks.length > 0 && (
                            <div className="flex flex-col gap-0.5">
                              {cellRisks.map((r) => (
                                <p key={r.id} className="text-xs text-muted-foreground">
                                  {r.category === "financial" ? "F" : "L"}: {r.factor}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ))}

            {/* X-axis labels */}
            <div className="flex gap-1">
              <div className={compact ? "w-8" : "w-16"} />
              {[1, 2, 3, 4, 5].map((impact) => (
                <div
                  key={impact}
                  className={cn(
                    "flex items-center justify-center text-muted-foreground",
                    cellSize,
                    compact ? "text-[9px]" : "text-[10px]"
                  )}
                >
                  <span className="truncate">
                    {compact ? impact : IMPACT_LABELS[impact]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* X-axis title */}
        <div className="flex justify-center">
          <span
            className={cn(
              "text-muted-foreground font-medium",
              compact ? "text-[9px]" : "text-[10px]"
            )}
          >
            IMPACT
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {[
            { label: "Low (1-4)", color: "bg-emerald-500/30" },
            { label: "Medium (5-9)", color: "bg-amber-500/30" },
            { label: "High (10-15)", color: "bg-orange-500/30" },
            { label: "Critical (16-25)", color: "bg-red-500/30" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cn("h-3 w-3 rounded-sm", item.color)} />
              <span className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
