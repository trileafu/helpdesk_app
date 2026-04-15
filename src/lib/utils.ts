import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTicketCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'TIX-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const RECENT_TICKET_CODES_STORAGE_KEY = "helpdesk_recent_ticket_codes"
const RECENT_TICKET_CODES_LIMIT = 5
const RECENT_TICKET_CODES_CHANGED_EVENT = "helpdesk_recent_ticket_codes_changed"

function normalizeTicketCode(code: string) {
  return code.trim().toUpperCase()
}

function readStoredTicketCodes() {
  if (typeof window === "undefined") {
    return [] as string[]
  }

  try {
    const rawValue = window.localStorage.getItem(RECENT_TICKET_CODES_STORAGE_KEY)

    if (!rawValue) {
      return [] as string[]
    }

    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return [] as string[]
    }

    return parsedValue.filter((value): value is string => typeof value === "string")
  } catch {
    return [] as string[]
  }
}

function writeStoredTicketCodes(codes: string[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    RECENT_TICKET_CODES_STORAGE_KEY,
    JSON.stringify(codes),
  )
  window.dispatchEvent(new Event(RECENT_TICKET_CODES_CHANGED_EVENT))
}

export function getRecentTicketCodes() {
  return readStoredTicketCodes().slice(0, RECENT_TICKET_CODES_LIMIT)
}

export function addRecentTicketCode(code: string) {
  if (typeof window === "undefined") {
    return
  }

  const normalizedCode = normalizeTicketCode(code)

  if (!normalizedCode) {
    return
  }

  const currentCodes = readStoredTicketCodes()
  const nextCodes = [
    normalizedCode,
    ...currentCodes.filter((existingCode) => existingCode !== normalizedCode),
  ].slice(0, RECENT_TICKET_CODES_LIMIT)

  writeStoredTicketCodes(nextCodes)
}

export function recentTicketCodesChangedEventName() {
  return RECENT_TICKET_CODES_CHANGED_EVENT
}
