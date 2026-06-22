export interface ISiswa {
    id: string,
    accountId: string,
    nama: string,
    nis: string,
    kelas: string,
    username: string,
    password: string,
}

export interface ISiswaMetadata {
    count: number
}

export interface ISiswaData {
    rows: ISiswa[],
    metadata: ISiswaMetadata
}

export interface ISiswaResponse {
    success: boolean,
    code: number,
    data: ISiswaData
}