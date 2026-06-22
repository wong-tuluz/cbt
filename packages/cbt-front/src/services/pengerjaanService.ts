import api from './api'

// Interface untuk response pengerjaan
export interface IPengerjaan {
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

export interface IPengerjaanResponse {
  success: boolean
  code: number
  data: IPengerjaan[]
}

export interface Payload {
  jadwalId: string
  token: string
}

export interface CreateSessionResponse {
  success: boolean
  code: number
  data?: {
    id: string
  }
  message?: string
}

// Function untuk get session by jadwal
export async function getListSessionByJadwal(jadwalId: string): Promise<IPengerjaanResponse> {
  try {
    const response = await api.get<IPengerjaanResponse>(`/pengerjaan?jadwalId=${jadwalId}`)
    return response
  } catch (error) {
    console.error('Error fetching sessions:', error)
    throw error
  }
}

export async function createSession(payload: Payload){
    return api.post<CreateSessionResponse>('/pengerjaan', payload)
}

export async function endSession(sessionId: string){
    return api.post<unknown | null>(`/pengerjaan/${sessionId}/finish`)
}
