"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  Building2,
  DollarSign,
  Trash2,
  Grid3X3,
} from "lucide-react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { RiskBadge } from "@/components/risk-badge"
import { RiskMatrix } from "@/components/risk-matrix"
import { MitigationAccordion } from "@/components/mitigation-accordion"
import { useTenderStore } from "@/lib/store"
import { formatCurrency, getRiskColor, getRiskBgColor } from "@/lib/risk-utils"
import { cn } from "@/lib/utils"

export default function TenderReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { getTender, deleteTender } = useTenderStore()
  const tender = getTender(id)

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <h2 className="text-lg font-semibold">Tender not found</h2>
        <p className="text-muted-foreground">
          The tender you are looking for does not exist.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    deleteTender(tender.id)
    toast.success("Tender deleted successfully")
    router.push("/tenders")
  }

  const financialRisks = tender.risks.filter((r) => r.category === "financial")
  const legalRisks = tender.risks.filter((r) => r.category === "legal")

  // Radar chart data
  const radarData = tender.risks.map((r) => ({
    factor: r.factor.length > 20 ? r.factor.slice(0, 18) + "..." : r.factor,
    score: r.score,
    fullFactor: r.factor,
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tenders">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to tenders</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">
              {tender.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {tender.organization}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {formatCurrency(tender.value, tender.currency)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(tender.deadline), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/tenders/${tender.id}/matrix`}>
              <Grid3X3 className="mr-2 h-4 w-4" />
              Full Matrix
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete tender</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tender?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the tender analysis for &quot;{tender.name}&quot;.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Overall score card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-6">
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full border-4",
                  getRiskBgColor(tender.overallLevel),
                  `border-current`,
                  getRiskColor(tender.overallLevel)
                )}
              >
                <span className="text-2xl font-bold tabular-nums">
                  {tender.overallScore}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{tender.overallScore} / 100</span>
                  <RiskBadge level={tender.overallLevel} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
              <div>
                <p className="text-2xl font-bold">{tender.risks.length}</p>
                <p className="text-xs text-muted-foreground">Total Risks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">
                  {tender.risks.filter((r) => r.level === "low").length}
                </p>
                <p className="text-xs text-muted-foreground">Low</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {tender.risks.filter((r) => r.level === "high").length}
                </p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {tender.risks.filter((r) => r.level === "critical").length}
                </p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Risk breakdown tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Breakdown</CardTitle>
            <CardDescription>Detailed risk factor scores by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="financial">
              <TabsList className="w-full">
                <TabsTrigger value="financial" className="flex-1">
                  Financial ({financialRisks.length})
                </TabsTrigger>
                <TabsTrigger value="legal" className="flex-1">
                  Legal ({legalRisks.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="financial">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factor</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">I</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-right">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialRisks
                      .sort((a, b) => b.score - a.score)
                      .map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-sm">{r.factor}</TableCell>
                          <TableCell className="text-center tabular-nums">{r.likelihood}</TableCell>
                          <TableCell className="text-center tabular-nums">{r.impact}</TableCell>
                          <TableCell className="text-center font-mono tabular-nums">{r.score}</TableCell>
                          <TableCell className="text-right">
                            <RiskBadge level={r.level} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="legal">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factor</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">I</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-right">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legalRisks
                      .sort((a, b) => b.score - a.score)
                      .map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-sm">{r.factor}</TableCell>
                          <TableCell className="text-center tabular-nums">{r.likelihood}</TableCell>
                          <TableCell className="text-center tabular-nums">{r.impact}</TableCell>
                          <TableCell className="text-center font-mono tabular-nums">{r.score}</TableCell>
                          <TableCell className="text-right">
                            <RiskBadge level={r.level} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Risk radar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile</CardTitle>
            <CardDescription>Radar visualization of all risk factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis
                    dataKey="factor"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 25]}
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                  />
                  <Radar
                    name="Risk Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact risk matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix</CardTitle>
          <CardDescription>
            5x5 risk scoring matrix with plotted risk factors
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <RiskMatrix risks={tender.risks} compact />
        </CardContent>
      </Card>

      {/* Mitigation strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Mitigation Strategies</CardTitle>
          <CardDescription>
            Risk factors and their mitigation plans, sorted by severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MitigationAccordion risks={tender.risks} />
        </CardContent>
      </Card>
    </div>
  )
}
