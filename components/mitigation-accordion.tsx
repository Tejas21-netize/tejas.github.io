"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RiskBadge } from "@/components/risk-badge"
import type { RiskAssessment } from "@/lib/types"

interface MitigationAccordionProps {
  risks: RiskAssessment[]
}

export function MitigationAccordion({ risks }: MitigationAccordionProps) {
  const sortedRisks = [...risks].sort((a, b) => b.score - a.score)

  return (
    <Accordion type="multiple" className="w-full">
      {sortedRisks.map((risk) => (
        <AccordionItem key={risk.id} value={risk.id}>
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-3">
              <RiskBadge level={risk.level} />
              <span className="font-medium">{risk.factor}</span>
              <span className="text-xs text-muted-foreground capitalize">
                ({risk.category})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pl-2">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Likelihood</p>
                  <p className="font-medium">{risk.likelihood}/5</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Impact</p>
                  <p className="font-medium">{risk.impact}/5</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Score</p>
                  <p className="font-medium">{risk.score}/25</p>
                </div>
              </div>
              {risk.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{risk.description}</p>
                </div>
              )}
              {risk.mitigation ? (
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Mitigation Strategy
                  </p>
                  <p className="text-sm">{risk.mitigation}</p>
                </div>
              ) : (
                <div className="rounded-md border border-dashed bg-muted/30 p-3">
                  <p className="text-sm text-muted-foreground italic">
                    No mitigation strategy provided
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
