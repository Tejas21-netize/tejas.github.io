"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { ArrowUpDown, MoreHorizontal, Trash2, Eye, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RiskBadge } from "@/components/risk-badge"
import type { Tender, RiskLevel } from "@/lib/types"
import { formatCurrency } from "@/lib/risk-utils"

type SortKey = "name" | "value" | "deadline" | "overallScore"
type SortDir = "asc" | "desc"

interface TenderTableProps {
  tenders: Tender[]
  onDelete: (id: string) => void
}

export function TenderTable({ tenders, onDelete }: TenderTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("overallScore")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const filtered = useMemo(() => {
    let result = [...tenders]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.organization.toLowerCase().includes(q)
      )
    }

    // Level filter
    if (filterLevel !== "all") {
      result = result.filter((t) => t.overallLevel === filterLevel)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "value":
          cmp = a.value - b.value
          break
        case "deadline":
          cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
        case "overallScore":
          cmp = a.overallScore - b.overallScore
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [tenders, search, filterLevel, sortKey, sortDir])

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      toast.success("Tender deleted")
      setDeleteId(null)
    }
  }

  const SortButton = ({
    column,
    children,
  }: {
    column: SortKey
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  if (tenders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No tenders yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first tender analysis to get started
          </p>
        </div>
        <Button asChild>
          <Link href="/tenders/new">
            <FilePlus className="mr-2 h-4 w-4" />
            New Tender
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Search tenders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {tenders.length} tenders
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton column="name">Name</SortButton>
              </TableHead>
              <TableHead className="hidden md:table-cell">Organization</TableHead>
              <TableHead className="hidden lg:table-cell">
                <SortButton column="value">Value</SortButton>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <SortButton column="deadline">Deadline</SortButton>
              </TableHead>
              <TableHead className="text-center">
                <SortButton column="overallScore">Score</SortButton>
              </TableHead>
              <TableHead className="text-center">Level</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No tenders match your filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tender) => (
                <TableRow
                  key={tender.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/tenders/${tender.id}`)}
                >
                  <TableCell className="font-medium">{tender.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {tender.organization}
                  </TableCell>
                  <TableCell className="hidden tabular-nums lg:table-cell">
                    {formatCurrency(tender.value, tender.currency)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {format(new Date(tender.deadline), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold tabular-nums">
                    {tender.overallScore}
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge level={tender.overallLevel} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tenders/${tender.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(tender.id)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tender?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this tender analysis. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
