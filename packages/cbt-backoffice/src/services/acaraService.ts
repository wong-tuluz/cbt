import api from "./api"

export interface IJadwal {
  id?: string
  paketSoalId: string
  title: string
  startTime: string
  endTime: string
  timeLimit: number
  attempts: number
  token: string
  remoteId?: string | null
  questionCount?: number
  attemptsRemaining?: number
  status?: string
}

export interface IAcara {
  id?: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  remoteId?: string | null
  jadwals?: IJadwal[]
}

export interface IPeserta {
  id: string
  acaraId: string
  siswaId: string
  remoteId?: string | null
  siswa?: {
    nama: string
    nis: string
    kelas: string
  }
}

export async function getAcaraList(): Promise<IAcara[]> {
  try {
    const response = await api.get<IAcara[]>("/acara")
    return response || []
  } catch (error) {
    console.error("Error fetching acara list:", error)
    throw error
  }
}

export async function getAcaraById(id: string): Promise<IAcara> {
  try {
    const response = await api.get<IAcara>(`/acara/${id}`)
    return response
  } catch (error) {
    console.error(`Error fetching acara id ${id}:`, error)
    throw error
  }
}

export async function createAcara(payload: IAcara): Promise<any> {
  try {
    const response = await api.post<any>("/acara", payload)
    return response
  } catch (error) {
    console.error("Error creating acara:", error)
    throw error
  }
}

export async function getJadwalListByAcara(acaraId: string): Promise<any[]> {
  try {
    const response = await api.get<any[]>(`/acara/jadwal?acaraId=${acaraId}`)
    return response || []
  } catch (error) {
    console.error(`Error fetching jadwal for acara ${acaraId}:`, error)
    throw error
  }
}

export async function getAcaraPeserta(acaraId: string): Promise<any[]> {
  try {
    const response = await api.get<any[]>(`/acara/${acaraId}/peserta`)
    return response || []
  } catch (error) {
    console.error(`Error fetching peserta for acara ${acaraId}:`, error)
    throw error
  }
}

export async function saveJadwal(
  acaraId: string,
  payload: {
    id?: string
    paketSoalId: string
    title: string
    startTime: string
    endTime: string
    timeLimit: number
    attempts: number
    token: string
    remoteId?: string | null
  }
): Promise<any> {
  try {
    const response = await api.post<any>(`/acara/${acaraId}/jadwal`, payload)
    return response
  } catch (error) {
    console.error(`Error saving jadwal inside acara ${acaraId}:`, error)
    throw error
  }
}

export async function deleteJadwal(acaraId: string, jadwalId: string): Promise<any> {
  try {
    const response = await api.delete<any>(`/acara/${acaraId}/jadwal/${jadwalId}`)
    return response
  } catch (error) {
    console.error(`Error deleting jadwal ${jadwalId} inside acara ${acaraId}:`, error)
    throw error
  }
}
