"use client"

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Tender } from "@/lib/types"

interface RiskChartsProps {
  tenders: Tender[]
}

const RISK_COLORS: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
}

const CATEGORY_COLORS: Record<string, string> = {
  Financial: "#3b82f6",
  Legal: "#8b5cf6",
}

export function RiskDistributionChart({ tenders }: RiskChartsProps) {
  const distribution = [
    { level: "Low", count: tenders.filter((t) => t.overallLevel === "low").length },
    { level: "Medium", count: tenders.filter((t) => t.overallLevel === "medium").length },
    { level: "High", count: tenders.filter((t) => t.overallLevel === "high").length },
    { level: "Critical", count: tenders.filter((t) => t.overallLevel === "critical").length },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
        <CardDescription>Tenders by overall risk level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="level"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((entry) => (
                  <Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function CategoryBreakdownChart({ tenders }: RiskChartsProps) {
  const financialCount = tenders.reduce(
    (sum, t) => sum + t.risks.filter((r) => r.category === "financial").length,
    0
  )
  const legalCount = tenders.reduce(
    (sum, t) => sum + t.risks.filter((r) => r.category === "legal").length,
    0
  )

  const data = [
    { name: "Financial", value: financialCount },
    { name: "Legal", value: legalCount },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Risk assessments by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[260px] items-center justify-center text-muted-foreground">
            No risk data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Risk assessments by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
