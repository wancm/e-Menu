import { Session } from "@libs/shared/types/session"

export type SessionService = {
    initAsync(sessionTTL: number): Promise<Session>

    getAsync(id: string): Promise<Session>

    expiredAsync(id: string): Promise<number>

    resetExpiryAsync(id: string, sessionTTL: number): Promise<number>
}
