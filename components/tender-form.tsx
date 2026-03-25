"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { RiskSlider, RiskScoreDisplay } from "@/components/risk-slider"
import { RiskBadge } from "@/components/risk-badge"
import { useUser } from "@/hooks/use-user"
import { createTender } from "@/lib/supabase-operations"
import {
  FINANCIAL_RISK_FACTORS,
  LEGAL_RISK_FACTORS,
} from "@/lib/types"
import type { RiskAssessment, Tender } from "@/lib/types"
import { getRiskLevel, getRiskScore, computeOverallScore, getOverallLevel } from "@/lib/risk-utils"
import { cn } from "@/lib/utils"

const STEPS = [
  { label: "Tender Details", description: "Basic tender information" },
  { label: "Financial Risks", description: "Assess financial risk factors" },
  { label: "Legal Risks", description: "Assess legal/compliance risks" },
  { label: "Review & Submit", description: "Review and finalize" },
]

interface RiskFactorState {
  likelihood: number
  impact: number
  description: string
  mitigation: string
}

function createDefaultRiskState(): RiskFactorState {
  return { likelihood: 1, impact: 1, description: "", mitigation: "" }
}

export function TenderForm() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Tender details
  const [name, setName] = useState("")
  const [organization, setOrganization] = useState("")
  const [value, setValue] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [deadline, setDeadline] = useState<Date | undefined>()
  const [description, setDescription] = useState("")

  // Step 2: Financial risks
  const [financialRisks, setFinancialRisks] = useState<Record<string, RiskFactorState>>(() => {
    const init: Record<string, RiskFactorState> = {}
    for (const f of FINANCIAL_RISK_FACTORS) {
      init[f.key] = createDefaultRiskState()
    }
    return init
  })

  // Step 3: Legal risks
  const [legalRisks, setLegalRisks] = useState<Record<string, RiskFactorState>>(() => {
    const init: Record<string, RiskFactorState> = {}
    for (const f of LEGAL_RISK_FACTORS) {
      init[f.key] = createDefaultRiskState()
    }
    return init
  })

  const updateFinancialRisk = useCallback(
    (key: string, field: keyof RiskFactorState, val: string | number) => {
      setFinancialRisks((prev) => ({
        ...prev,
        [key]: { ...prev[key], [field]: val },
      }))
    },
    []
  )

  const updateLegalRisk = useCallback(
    (key: string, field: keyof RiskFactorState, val: string | number) => {
      setLegalRisks((prev) => ({
        ...prev,
        [key]: { ...prev[key], [field]: val },
      }))
    },
    []
  )

  const canGoNext = () => {
    if (step === 0) {
      return name.trim() !== "" && organization.trim() !== "" && value.trim() !== "" && deadline
    }
    return true
  }

  const buildRiskAssessments = (): RiskAssessment[] => {
    const risks: RiskAssessment[] = []

    for (const factor of FINANCIAL_RISK_FACTORS) {
      const r = financialRisks[factor.key]
      const score = getRiskScore(r.likelihood, r.impact)
      risks.push({
        id: crypto.randomUUID(),
        category: "financial",
        factor: factor.label,
        likelihood: r.likelihood,
        impact: r.impact,
        score,
        level: getRiskLevel(score),
        description: r.description,
        mitigation: r.mitigation,
      })
    }

    for (const factor of LEGAL_RISK_FACTORS) {
      const r = legalRisks[factor.key]
      const score = getRiskScore(r.likelihood, r.impact)
      risks.push({
        id: crypto.randomUUID(),
        category: "legal",
        factor: factor.label,
        likelihood: r.likelihood,
        impact: r.impact,
        score,
        level: getRiskLevel(score),
        description: r.description,
        mitigation: r.mitigation,
      })
    }

    return risks
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Not authenticated")
      return
    }

    setIsSubmitting(true)
    try {
      const risks = buildRiskAssessments()
      const overallScore = computeOverallScore(risks)

      const tender: Tender = {
        id: crypto.randomUUID(),
        name: name.trim(),
        organization: organization.trim(),
        value: parseFloat(value),
        deadline: deadline!,
        financialRisks: Object.fromEntries(
          Object.entries(financialRisks).map(([key, val]) => [
            key,
            { likelihood: val.likelihood, impact: val.impact },
          ])
        ),
        legalRisks: Object.fromEntries(
          Object.entries(legalRisks).map(([key, val]) => [
            key,
            { likelihood: val.likelihood, impact: val.impact },
          ])
        ),
        createdAt: new Date(),
      }

      const result = await createTender(user.id, tender)
      if (result) {
        toast.success("Tender analysis created successfully")
        router.push(`/tenders/${result.id}`)
      } else {
        toast.error("Failed to create tender")
      }
    } catch (error) {
      console.error("Error submitting tender:", error)
      toast.error("An error occurred while creating the tender")
    } finally {
      setIsSubmitting(false)
    }
  }

  const risks = buildRiskAssessments()
  const overallScore = computeOverallScore(risks)
  const overallLevel = getOverallLevel(overallScore)

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <nav aria-label="Progress" className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (i < step || canGoNext()) setStep(i)
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            <span
              className={cn(
                "hidden text-sm md:inline",
                i === step ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <Separator className="!w-6 md:!w-12" />
            )}
          </div>
        ))}
      </nav>

      {/* Step content */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tender Details</CardTitle>
            <CardDescription>Enter the basic information about this tender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Tender Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Infrastructure Upgrade Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="org">Organization / Client *</Label>
                <Input
                  id="org"
                  placeholder="e.g. Acme Corporation"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="value">Tender Value *</Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    type="number"
                    placeholder="e.g. 500000"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Brief description of the tender scope and requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          {FINANCIAL_RISK_FACTORS.map((factor) => {
            const r = financialRisks[factor.key]
            return (
              <Card key={factor.key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{factor.label}</CardTitle>
                    <RiskScoreDisplay likelihood={r.likelihood} impact={r.impact} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <RiskSlider
                      label="Likelihood"
                      type="likelihood"
                      value={r.likelihood}
                      onChange={(v) => updateFinancialRisk(factor.key, "likelihood", v)}
                    />
                    <RiskSlider
                      label="Impact"
                      type="impact"
                      value={r.impact}
                      onChange={(v) => updateFinancialRisk(factor.key, "impact", v)}
                    />
                    <div className="flex flex-col gap-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Describe this risk factor..."
                        value={r.description}
                        onChange={(e) =>
                          updateFinancialRisk(factor.key, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Mitigation Strategy</Label>
                      <Textarea
                        placeholder="How to mitigate this risk..."
                        value={r.mitigation}
                        onChange={(e) =>
                          updateFinancialRisk(factor.key, "mitigation", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          {LEGAL_RISK_FACTORS.map((factor) => {
            const r = legalRisks[factor.key]
            return (
              <Card key={factor.key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{factor.label}</CardTitle>
                    <RiskScoreDisplay likelihood={r.likelihood} impact={r.impact} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <RiskSlider
                      label="Likelihood"
                      type="likelihood"
                      value={r.likelihood}
                      onChange={(v) => updateLegalRisk(factor.key, "likelihood", v)}
                    />
                    <RiskSlider
                      label="Impact"
                      type="impact"
                      value={r.impact}
                      onChange={(v) => updateLegalRisk(factor.key, "impact", v)}
                    />
                    <div className="flex flex-col gap-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Describe this risk factor..."
                        value={r.description}
                        onChange={(e) =>
                          updateLegalRisk(factor.key, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Mitigation Strategy</Label>
                      <Textarea
                        placeholder="How to mitigate this risk..."
                        value={r.mitigation}
                        onChange={(e) =>
                          updateLegalRisk(factor.key, "mitigation", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Summary</CardTitle>
              <CardDescription>Review all details before submitting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tender Name</p>
                  <p className="font-medium">{name || "---"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{organization || "---"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="font-medium">
                    {value ? `${currency} ${parseFloat(value).toLocaleString()}` : "---"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {deadline ? format(deadline, "PPP") : "---"}
                  </p>
                </div>
                {description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Overall Risk Assessment</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold tabular-nums">{overallScore}/100</span>
                  <RiskBadge level={overallLevel} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <h4 className="text-sm font-medium text-muted-foreground">Financial Risks</h4>
                <div className="grid gap-1">
                  {FINANCIAL_RISK_FACTORS.map((f) => {
                    const r = financialRisks[f.key]
                    const score = r.likelihood * r.impact
                    return (
                      <div key={f.key} className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm">
                        <span>{f.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums">{score}</span>
                          <RiskBadge level={getRiskLevel(score)} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Separator className="my-2" />
                <h4 className="text-sm font-medium text-muted-foreground">Legal / Compliance Risks</h4>
                <div className="grid gap-1">
                  {LEGAL_RISK_FACTORS.map((f) => {
                    const r = legalRisks[f.key]
                    const score = r.likelihood * r.impact
                    return (
                      <div key={f.key} className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm">
                        <span>{f.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums">{score}</span>
                          <RiskBadge level={getRiskLevel(score)} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canGoNext()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canGoNext() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Analysis
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
