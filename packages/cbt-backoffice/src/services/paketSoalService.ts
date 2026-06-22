import api from "./api"

export interface IMateri {
  id: string
  title: string
  description?: string | null
  order: number
}

export interface IPaketSoal {
  id: string
  title: string
  description?: string | null
  remoteId?: string | null
  materi?: IMateri[]
}

export interface IPaketSoalResponse {
  success: boolean
  data: IPaketSoal[]
}

export async function getPaketSoalList(): Promise<IPaketSoal[]> {
  try {
    const response = await api.get<IPaketSoal[]>("/paket-soal")
    return response || []
  } catch (error) {
    console.error("Error fetching paket soal:", error)
    throw error
  }
}

export async function getPaketSoalById(id: string): Promise<IPaketSoal> {
  try {
    const response = await api.get<IPaketSoal>(`/paket-soal/${id}`)
    return response
  } catch (error) {
    console.error(`Error fetching paket soal id ${id}:`, error)
    throw error
  }
}

export async function createPaketSoal(payload: {
  title: string
  description?: string
  materi?: { title: string; order: number }[]
}): Promise<any> {
  try {
    const response = await api.post<any>("/paket-soal", payload)
    return response
  } catch (error) {
    console.error("Error creating paket soal:", error)
    throw error
  }
}

export async function updatePaketSoal(
  id: string,
  payload: {
    title: string
    description?: string
    materi?: { id?: string; title: string; order: number }[]
  }
): Promise<any> {
  try {
    const response = await api.put<any>(`/paket-soal/${id}`, payload)
    return response
  } catch (error) {
    console.error(`Error updating paket soal id ${id}:`, error)
    throw error
  }
}

export async function deletePaketSoal(id: string): Promise<any> {
  try {
    const response = await api.delete<any>(`/paket-soal/${id}`)
    return response
  } catch (error) {
    console.error(`Error deleting paket soal id ${id}:`, error)
    throw error
  }
}
