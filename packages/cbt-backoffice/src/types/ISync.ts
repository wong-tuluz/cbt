export interface IEventBO {
    id: string,
    nama_event: string,
    mulai: string,
    selesai: string,
    createdAt: string,
    synced: boolean
}

export interface IEventBOResponse {
    success: boolean,
    code: number,
    data: IEventBO[]
}

export interface IAgenda {
    id: string,
    remoteId: string,
    title: string,
    startTime: string,
    endTime: string,
    description: string,
    createdAt: string,
    updatedAt: string,
}

export interface IAgendaResponse {
    success: boolean,
    code: number,
    data: IAgenda[]
}