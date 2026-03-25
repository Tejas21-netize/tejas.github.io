"use client"

import Link from "next/link"
import { FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TenderTable } from "@/components/tender-table"
import { useTenderStore } from "@/lib/store"

export default function TendersPage() {
  const { tenders, deleteTender } = useTenderStore()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">All Tenders</h1>
          <p className="text-muted-foreground">
            View and manage all your tender risk analyses
          </p>
        </div>
        <Button asChild>
          <Link href="/tenders/new">
            <FilePlus className="mr-2 h-4 w-4" />
            New Tender
          </Link>
        </Button>
      </div>

      <TenderTable tenders={tenders} onDelete={deleteTender} />
    </div>
  )
}
