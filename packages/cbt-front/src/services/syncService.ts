import type { IEventBOResponse, IAgendaResponse } from "@/types/ISync"
import api from "./api"


export async function getEventBo(): Promise<IEventBOResponse> {
  try {
    const response = await api.get<IEventBOResponse>(`/sync/events`)
    return response
  } catch (error) {
    console.error('Error fetching event BO:', error)
    throw error
  }
}

export async function syncEventBo(id: string) {
  try {
    const response = await api.post<unknown>(`/sync/events/${id}/sync`)
    return response
  } catch (error) {
    console.error('Error syncing event BO:', error)
    throw error
  }
}

export async function getAgenda(): Promise<IAgendaResponse> {
  try {
    const response = await api.get<IAgendaResponse>(`/acara`)
    return response
  } catch (error) {
    console.error('Error fetching agenda:', error)
    throw error
  }
}

export async function pushUpload(id: string) {
  try {
    const response = await api.post<unknown>(`/sync/events/${id}/push`)
    return response
  } catch (error) {
    console.error('Error pushing upload:', error)
    throw error
  }
}