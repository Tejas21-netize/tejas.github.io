'use client'

import { createClient } from '@/lib/supabase/client'
import type { Tender } from './types'

const supabase = createClient()

export async function getTenders(userId: string): Promise<Tender[]> {
  const { data, error } = await supabase
    .from('tenders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tenders:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.tender_name,
    organization: item.organization || '',
    value: item.tender_value || 0,
    deadline: item.deadline ? new Date(item.deadline) : new Date(),
    financialRisks: item.financial_risks || {},
    legalRisks: item.legal_risks || {},
    createdAt: new Date(item.created_at),
  }))
}

export async function getTenderById(userId: string, tenderId: string): Promise<Tender | null> {
  const { data, error } = await supabase
    .from('tenders')
    .select('*')
    .eq('id', tenderId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    console.error('Error fetching tender:', error)
    return null
  }

  return {
    id: data.id,
    name: data.tender_name,
    organization: data.organization || '',
    value: data.tender_value || 0,
    deadline: data.deadline ? new Date(data.deadline) : new Date(),
    financialRisks: data.financial_risks || {},
    legalRisks: data.legal_risks || {},
    createdAt: new Date(data.created_at),
  }
}

export async function createTender(userId: string, tender: Tender): Promise<Tender | null> {
  const { data, error } = await supabase
    .from('tenders')
    .insert({
      user_id: userId,
      tender_name: tender.name,
      organization: tender.organization,
      tender_value: tender.value,
      deadline: tender.deadline.toISOString(),
      financial_risks: tender.financialRisks,
      legal_risks: tender.legalRisks,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating tender:', error)
    return null
  }

  return {
    id: data.id,
    name: data.tender_name,
    organization: data.organization || '',
    value: data.tender_value || 0,
    deadline: data.deadline ? new Date(data.deadline) : new Date(),
    financialRisks: data.financial_risks || {},
    legalRisks: data.legal_risks || {},
    createdAt: new Date(data.created_at),
  }
}

export async function updateTender(userId: string, tenderId: string, tender: Partial<Tender>): Promise<Tender | null> {
  const updateData: any = {}

  if (tender.name) updateData.tender_name = tender.name
  if (tender.organization) updateData.organization = tender.organization
  if (tender.value !== undefined) updateData.tender_value = tender.value
  if (tender.deadline) updateData.deadline = tender.deadline.toISOString()
  if (tender.financialRisks) updateData.financial_risks = tender.financialRisks
  if (tender.legalRisks) updateData.legal_risks = tender.legalRisks

  const { data, error } = await supabase
    .from('tenders')
    .update(updateData)
    .eq('id', tenderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating tender:', error)
    return null
  }

  return {
    id: data.id,
    name: data.tender_name,
    organization: data.organization || '',
    value: data.tender_value || 0,
    deadline: data.deadline ? new Date(data.deadline) : new Date(),
    financialRisks: data.financial_risks || {},
    legalRisks: data.legal_risks || {},
    createdAt: new Date(data.created_at),
  }
}

export async function deleteTender(userId: string, tenderId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tenders')
    .delete()
    .eq('id', tenderId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting tender:', error)
    return false
  }

  return true
}
