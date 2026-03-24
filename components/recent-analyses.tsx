"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RiskBadge } from "@/components/risk-badge"
import type { Tender } from "@/lib/types"

interface RecentAnalysesProps {
  tenders: Tender[]
}

export function RecentAnalyses({ tenders }: RecentAnalysesProps) {
  const recent = [...tenders]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Analyses</CardTitle>
        <CardDescription>Last 5 tender risk assessments</CardDescription>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            No tenders analyzed yet. Create your first analysis to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((tender) => (
                <TableRow key={tender.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link
                      href={`/tenders/${tender.id}`}
                      className="hover:underline"
                    >
                      {tender.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tender.organization}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(tender.updatedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {tender.overallScore}
                  </TableCell>
                  <TableCell className="text-right">
                    <RiskBadge level={tender.overallLevel} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
