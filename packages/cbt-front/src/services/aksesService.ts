import type { IAkses, IAksesResponse } from "@/types/IAkses"
import api from "./api"


export async function getSetting(): Promise<IAksesResponse> {
  try {
    const response = await api.get<IAksesResponse>(`/settings`)
    return response
  } catch (error) {
    console.error('Error fetching event BO:', error)
    throw error
  }
}

export interface IAksesSucces {
    success: boolean,
    code: number,
}

export async function updateSetting(payload: IAkses){
  try {
    const response = await api.put<IAksesSucces>(`/settings`, payload)
    return response
  } catch (error) {
    console.error('Error fetching event BO:', error)
    throw error
  }
}



