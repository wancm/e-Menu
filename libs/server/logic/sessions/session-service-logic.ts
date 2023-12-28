import { CacheService } from "@libs/server/types/services/cache.service"
import { SessionService } from "@libs/server/types/services/session-service"
import { Session } from "@libs/shared/types/session"
import { AppUtil } from "@libs/shared/utils/app-util"

export class SessionServiceLogic implements SessionService {
    private readonly prefix = "SESSION-"
    private readonly sessionTTL = 30 * 60 // 30 minutes

    constructor(private cacheService: CacheService) {}

    async initAsync(sessionTTL: number = 0): Promise<Session> {
        if (!(sessionTTL > 0)) {
            sessionTTL = this.sessionTTL
        }

        const id = AppUtil.genId()

        const session = {
            id,
        } as const

        await this.cacheService.trySetAsync(`${this.prefix}${id}`, session, sessionTTL)

        return session
    }

    async getAsync(id: string): Promise<Session> {
        return await this.cacheService.tryGetAsync(`${this.prefix}${id}`)
    }

    async expiredAsync(id: string): Promise<number> {
        return await this.cacheService.tryExpiredAsync(`${this.prefix}${id}`)
    }

    async resetExpiryAsync(id: string, sessionTTL: number = 0): Promise<number> {
        if (!(sessionTTL > 0)) {
            sessionTTL = this.sessionTTL
        }

        return await this.cacheService.extendExpiryAsync(`${this.prefix}${id}`, sessionTTL)
    }
}

//
// if (import.meta.vitest) {
//     const { describe, expect, test, vi, afterEach } = import.meta.vitest
//     describe("#session-service-logic.ts", () => {
//
//         afterEach(() => {
//             vi.restoreAllMocks()
//         })
//
//     })
// }
