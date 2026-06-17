export interface IProktorSession {
    id: string,
    status: string,
    timeLimit: number,
    finishedAt: string,
    questionCount: number,
    questionAnswered: number,
    strike: number,
    jadwal: {
        id: string,
        title: string,
        agendaId: string,
        paketSoalId: string,
        startTime: string,
        endTime: string,
        timeLimit: number,
        attempts: number,
        token: string
        agenda: {
            id: string,
            title: string,
            startTime: string,
            endTime: string,
            description: string
        }
    },
    siswa: {
        id: string,
        accountId: string,
        nama: string,
        nis: string,
        kelas: string,
        username: string,
        password: string
    }
}
        
}

export interface IProktorSessionResponse {
    success: string,
    code: number,
    data: IProktorSession[]
}