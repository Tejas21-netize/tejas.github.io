"use client"

import Link from "next/link"
import { FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardCards } from "@/components/dashboard-cards"
import { RiskDistributionChart, CategoryBreakdownChart } from "@/components/risk-charts"
import { RecentAnalyses } from "@/components/recent-analyses"
import { useTenderStore } from "@/lib/store"

export default function DashboardPage() {
  const { tenders } = useTenderStore()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your tender risk analysis portfolio
          </p>
        </div>
        <Button asChild>
          <Link href="/tenders/new">
            <FilePlus className="mr-2 h-4 w-4" />
            New Tender
          </Link>
        </Button>
      </div>

      <DashboardCards tenders={tenders} />

      <div className="grid gap-4 md:grid-cols-2">
        <RiskDistributionChart tenders={tenders} />
        <CategoryBreakdownChart tenders={tenders} />
      </div>

      <RecentAnalyses tenders={tenders} />
    </div>
  )
}
