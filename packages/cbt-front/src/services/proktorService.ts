import type { IProktorSessionResponse } from "@/types/IProktorSession"
import api from "./api"

export async function getProktorSessions(jadwalId : string): Promise<IProktorSessionResponse> {
  try {
    const response = await api.get<IProktorSessionResponse>(`/pengerjaan-detail?jadwalId=${jadwalId}`)
    return response
  } catch (error) {
    console.error('Error fetching proktor sessions:', error)
    throw error
  }
}

export async function resetStatus(sessionId : string) {
  try {
    const response = await api.post<unknown>(`/pengerjaan/${sessionId}/reset`)
    return response
  } catch (error) {
    console.error('Error session by ID:', error)
    throw error
  }
}

export async function resetAllStatus(jadwalId: string) {
  try {
    const response = await api.post<unknown>(`/pengerjaan/reset-all?jadwalId=${jadwalId}`)
    return response
  } catch (error) {
    console.error('Error resetting all sessions:', error)
    throw error
  }
}

export async function resetTime(sessionId: string) {
  try {
    const response = await api.post<unknown>(`/pengerjaan/${sessionId}/reset-time`)
    return response
  } catch (error) {
    console.error('Error resetting session time:', error)
    throw error
  }
}

export async function resetAllTime(jadwalId: string) {
  try {
    const response = await api.post<unknown>(`/pengerjaan/reset-time-all?jadwalId=${jadwalId}`)
    return response
  } catch (error) {
    console.error('Error resetting all session times:', error)
    throw error
  }
}