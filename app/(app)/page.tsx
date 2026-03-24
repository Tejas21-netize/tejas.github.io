"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FilePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardCards } from "@/components/dashboard-cards"
import { RiskDistributionChart, CategoryBreakdownChart } from "@/components/risk-charts"
import { RecentAnalyses } from "@/components/recent-analyses"
import { getTenders } from "@/lib/supabase-operations"
import { useUser } from "@/hooks/use-user"
import type { Tender } from "@/lib/types"

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser()
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && user) {
      loadTenders()
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user, userLoading])

  const loadTenders = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getTenders(user.id)
      setTenders(data)
    } catch (error) {
      console.error('Error loading tenders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
