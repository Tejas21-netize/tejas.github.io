"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RiskMatrix } from "@/components/risk-matrix"
import { RiskBadge } from "@/components/risk-badge"
import { useTenderStore } from "@/lib/store"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function MatrixPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { getTender } = useTenderStore()
  const tender = getTender(id)

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <h2 className="text-lg font-semibold">Tender not found</h2>
        <Button asChild variant="outline">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/tenders/${tender.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to report</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Risk Matrix - {tender.name}
          </h1>
          <p className="text-muted-foreground">
            Interactive 5x5 risk scoring matrix
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Scoring Matrix</CardTitle>
          <CardDescription>
            Hover over cells to see positioned risk factors. The number badge indicates how many risks fall on that cell.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center overflow-x-auto">
          <RiskMatrix risks={tender.risks} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Risk Factors</CardTitle>
          <CardDescription>
            Complete list of risk factors plotted on the matrix above
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Factor</TableHead>
                <TableHead className="text-center">Likelihood</TableHead>
                <TableHead className="text-center">Impact</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-right">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...tender.risks]
                .sort((a, b) => b.score - a.score)
                .map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="capitalize text-muted-foreground">
                      {r.category}
                    </TableCell>
                    <TableCell className="font-medium">{r.factor}</TableCell>
                    <TableCell className="text-center tabular-nums">{r.likelihood}</TableCell>
                    <TableCell className="text-center tabular-nums">{r.impact}</TableCell>
                    <TableCell className="text-center font-mono font-bold tabular-nums">
                      {r.score}
                    </TableCell>
                    <TableCell className="text-right">
                      <RiskBadge level={r.level} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
