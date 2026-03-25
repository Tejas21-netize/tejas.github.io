"use client"

import { FileText, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Tender } from "@/lib/types"
import { formatCurrency } from "@/lib/risk-utils"

interface DashboardCardsProps {
  tenders: Tender[]
}

export function DashboardCards({ tenders }: DashboardCardsProps) {
  const totalTenders = tenders.length
  const analyzedTenders = tenders.filter((t) => t.status === "analyzed")
  const avgScore =
    analyzedTenders.length > 0
      ? Math.round(
          analyzedTenders.reduce((sum, t) => sum + t.overallScore, 0) /
            analyzedTenders.length
        )
      : 0
  const highCriticalCount = tenders.filter(
    (t) => t.overallLevel === "high" || t.overallLevel === "critical"
  ).length
  const valueAtRisk = tenders
    .filter((t) => t.overallLevel === "high" || t.overallLevel === "critical")
    .reduce((sum, t) => sum + t.value, 0)

  const cards = [
    {
      title: "Total Tenders",
      value: totalTenders.toString(),
      description: `${analyzedTenders.length} analyzed`,
      icon: FileText,
    },
    {
      title: "Avg. Risk Score",
      value: `${avgScore}/100`,
      description: analyzedTenders.length > 0 ? "Across all tenders" : "No tenders analyzed",
      icon: TrendingUp,
    },
    {
      title: "High / Critical Risk",
      value: highCriticalCount.toString(),
      description: "Tenders requiring attention",
      icon: AlertTriangle,
    },
    {
      title: "Value at Risk",
      value: formatCurrency(valueAtRisk, "USD"),
      description: "In high/critical tenders",
      icon: DollarSign,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
