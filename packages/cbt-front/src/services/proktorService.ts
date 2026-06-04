import type { IProktorSessionResponse } from "@/types/IProktorSession"
import api from "./api"

export async function getProktorSessions(jadwalId : string): Promise<IProktorSessionResponse> {
  try {
    const response = await api.get<IProktorSessionResponse>(`/work-session-detail?jadwalId=${jadwalId}`)
    return response
  } catch (error) {
    console.error('Error fetching proktor sessions:', error)
    throw error
  }
}

export async function resetStatus(sessionId : string) {
  try {
    const response = await api.post<unknown>(`/work-session/${sessionId}/reset`)
    return response
  } catch (error) {
    console.error('Error session by ID:', error)
    throw error
  }
}