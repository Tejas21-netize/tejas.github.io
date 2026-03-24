export type RiskLevel = "low" | "medium" | "high" | "critical"
export type TenderStatus = "draft" | "analyzed" | "archived"
export type RiskCategory = "financial" | "legal"

export interface RiskAssessment {
  id: string
  category: RiskCategory
  factor: string
  likelihood: number // 1-5
  impact: number // 1-5
  score: number // likelihood * impact
  level: RiskLevel
  description: string
  mitigation: string
}

export interface Tender {
  id: string
  name: string
  organization: string
  value: number
  currency: string
  deadline: string
  description: string
  status: TenderStatus
  createdAt: string
  updatedAt: string
  risks: RiskAssessment[]
  overallScore: number
  overallLevel: RiskLevel
}

export interface FinancialRiskFactors {
  budgetAccuracy: { likelihood: number; impact: number; description: string; mitigation: string }
  paymentTerms: { likelihood: number; impact: number; description: string; mitigation: string }
  currencyRisk: { likelihood: number; impact: number; description: string; mitigation: string }
  costOverrun: { likelihood: number; impact: number; description: string; mitigation: string }
  financialStability: { likelihood: number; impact: number; description: string; mitigation: string }
  hiddenCosts: { likelihood: number; impact: number; description: string; mitigation: string }
}

export interface LegalRiskFactors {
  regulatoryCompliance: { likelihood: number; impact: number; description: string; mitigation: string }
  contractTerms: { likelihood: number; impact: number; description: string; mitigation: string }
  intellectualProperty: { likelihood: number; impact: number; description: string; mitigation: string }
  liability: { likelihood: number; impact: number; description: string; mitigation: string }
  disputeResolution: { likelihood: number; impact: number; description: string; mitigation: string }
  dataProtection: { likelihood: number; impact: number; description: string; mitigation: string }
}

export const FINANCIAL_RISK_FACTORS = [
  { key: "budgetAccuracy", label: "Budget Estimation Accuracy" },
  { key: "paymentTerms", label: "Payment Terms & Cash Flow" },
  { key: "currencyRisk", label: "Currency / Exchange Risk" },
  { key: "costOverrun", label: "Cost Overrun Potential" },
  { key: "financialStability", label: "Financial Stability of Parties" },
  { key: "hiddenCosts", label: "Hidden Costs & Contingencies" },
] as const

export const LEGAL_RISK_FACTORS = [
  { key: "regulatoryCompliance", label: "Regulatory Compliance" },
  { key: "contractTerms", label: "Contract Terms & Conditions" },
  { key: "intellectualProperty", label: "Intellectual Property Rights" },
  { key: "liability", label: "Liability & Indemnification" },
  { key: "disputeResolution", label: "Dispute Resolution Mechanisms" },
  { key: "dataProtection", label: "Data Protection & Privacy" },
] as const

export const LIKELIHOOD_LABELS: Record<number, string> = {
  1: "Rare",
  2: "Unlikely",
  3: "Possible",
  4: "Likely",
  5: "Almost Certain",
}

export const IMPACT_LABELS: Record<number, string> = {
  1: "Negligible",
  2: "Minor",
  3: "Moderate",
  4: "Major",
  5: "Severe",
}
