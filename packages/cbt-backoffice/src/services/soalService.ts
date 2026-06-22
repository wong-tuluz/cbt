import api from "./api"

export interface IJawabanSoal {
  id?: string
  value: string
  isCorrect: boolean
  order: number
}

export interface ISoal {
  id?: string
  materiSoalId: string
  type: "single-choice" | "multiple-choice" | "essay"
  prompt: string
  order: number
  weightCorrect: number
  weightWrong: number
  jawaban?: IJawabanSoal[]
}

export async function getSoalListByMateri(materiSoalId: string): Promise<ISoal[]> {
  try {
    const response = await api.get<ISoal[]>(`/soal?materiSoalId=${materiSoalId}`)
    return response || []
  } catch (error) {
    console.error(`Error fetching soal for materi ${materiSoalId}:`, error)
    throw error
  }
}

export async function getSoalById(id: string): Promise<ISoal> {
  try {
    const response = await api.get<ISoal>(`/soal/${id}`)
    return response
  } catch (error) {
    console.error(`Error fetching soal id ${id}:`, error)
    throw error
  }
}

export async function createSoal(payload: ISoal): Promise<any> {
  try {
    const response = await api.post<any>("/soal", payload)
    return response
  } catch (error) {
    console.error("Error creating soal:", error)
    throw error
  }
}

export async function updateSoal(id: string, payload: Partial<ISoal>): Promise<any> {
  try {
    const response = await api.patch<any>(`/soal/${id}`, payload)
    return response
  } catch (error) {
    console.error(`Error updating soal id ${id}:`, error)
    throw error
  }
}

export async function deleteSoal(id: string): Promise<any> {
  try {
    const response = await api.delete<any>(`/soal/${id}`)
    return response
  } catch (error) {
    console.error(`Error deleting soal id ${id}:`, error)
    throw error
  }
}
