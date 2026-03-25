import { TenderForm } from "@/components/tender-form"

export default function NewTenderPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">New Tender Analysis</h1>
        <p className="text-muted-foreground">
          Create a new risk assessment for a tender
        </p>
      </div>
      <TenderForm />
    </div>
  )
}
