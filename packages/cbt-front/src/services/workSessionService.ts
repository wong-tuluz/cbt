import api from './api'

// Interface untuk response work session
export interface IWorkSession {
  id: string
  siswaId: string
  jadwalId: string
  paketSoalId: string
  materiSoalId: string | null
  status: string
  timeLimit: number
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface IWorkSessionsResponse {
  success: boolean
  code: number
  data: IWorkSession[]
}

export interface Payload {
  jadwalId: string
  token: string
}

export interface CreateSessionResponse {
  success: boolean
  code: number
  data?: { // Jadikan optional untuk handle error case
    id: string
  }
  message?: string
}

// Function untuk get session by jadwal
export async function getListSessionByJadwal(jadwalId: string): Promise<IWorkSessionsResponse> {
  try {
    const response = await api.get<IWorkSessionsResponse>(`/work-session?jadwalId=${jadwalId}`)
    return response
  } catch (error) {
    console.error('Error fetching sessions:', error)
    throw error
  }
}

export async function createSession(payload: Payload){
    return api.post<CreateSessionResponse>('/work-session', payload)
}

export async function endSession(sessionId: string){
    return api.post<unknown | null>(`/work-session/${sessionId}/finish`)
}
