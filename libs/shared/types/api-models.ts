export type ApiRequest = {
    body: any
    params: any
    query: any
}

export type ApiResponse<T> = {
    status: number
    message?: string
    data?: T
    error?: any
}
