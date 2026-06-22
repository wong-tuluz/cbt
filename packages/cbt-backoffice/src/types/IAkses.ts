export interface IAkses {
    safe_mode: boolean,
    show_hasil: boolean,
}

export interface IAksesResponse {
    success: boolean,
    code: number,
    data: IAkses
}