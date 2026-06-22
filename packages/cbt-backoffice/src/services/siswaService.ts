import type { ISiswaResponse } from "@/types/ISiswa"
import api from "./api"

export async function getListSsiswa(limit: number = 20, offset: number = 0): Promise<ISiswaResponse> {
  try {
    const response = await api.get<ISiswaResponse>(`/siswa?limit=${limit}&offset=${offset}`)
    return response
  } catch (error) {
    console.error('Error fetching siswa:', error)
    throw error
  }
}

export async function setPassword(siswaId: string, password: string) {
  try {
    const response = await api.post<unknown>(`/siswa/${siswaId}/set-password`, {
      password
    })
    return response
  } catch (error) {
    console.error('Error setting password:', error)
    throw error
  }
}

export async function setAccount(siswaId: string) {
  try {
    const response = await api.post<unknown>(`/siswa/${siswaId}/set-account`)
    return response
  } catch (error) {
    console.error('Error deleting siswa:', error)
    throw error
  }
}