"use client"

import { useCallback, useSyncExternalStore } from "react"
import type { Tender } from "./types"

const STORAGE_KEY = "tender-risk-analysis-data"

let listeners: Array<() => void> = []
let cachedSnapshot: Tender[] | null = null
let cachedRaw: string | null = null
const SERVER_SNAPSHOT: Tender[] = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): Tender[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw && cachedSnapshot !== null) {
    return cachedSnapshot
  }
  cachedRaw = raw
  cachedSnapshot = raw ? JSON.parse(raw) : []
  return cachedSnapshot!
}

function getServerSnapshot(): Tender[] {
  return SERVER_SNAPSHOT
}

function saveTenders(tenders: Tender[]) {
  const raw = JSON.stringify(tenders)
  localStorage.setItem(STORAGE_KEY, raw)
  cachedRaw = raw
  cachedSnapshot = tenders
  emitChange()
}

export function useTenderStore() {
  const tenders = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addTender = useCallback((tender: Tender) => {
    const current = getSnapshot()
    saveTenders([...current, tender])
  }, [])

  const updateTender = useCallback((id: string, updates: Partial<Tender>) => {
    const current = getSnapshot()
    const updated = current.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    )
    saveTenders(updated)
  }, [])

  const deleteTender = useCallback((id: string) => {
    const current = getSnapshot()
    saveTenders(current.filter((t) => t.id !== id))
  }, [])

  const getTender = useCallback(
    (id: string): Tender | undefined => {
      return tenders.find((t) => t.id === id)
    },
    [tenders]
  )

  return {
    tenders,
    addTender,
    updateTender,
    deleteTender,
    getTender,
  }
}
