/**
 * Factory that internally building instances that are supported by Vercel Edge function.
 * This factory is useful in context such as Next Middleware.
 * Vercel Edge function only has limited node functionality.
 * lib such as MongoDbClient is not supported in Vercel Edge function.
 */
import { ClientInfoServiceLogicExpress } from "@libs/server/logic/client-info/client-info-service.logic"
import { SessionServiceLogic } from "@libs/server/logic/sessions/session-service-logic"
import { CacheService } from "@libs/server/types/services/cache.service"
import { ClientInfoService } from "@libs/server/types/services/client-info.service"
import { SessionService } from "@libs/server/types/services/session-service"
import { MemoryCacheService } from "@libs/shared/cache/memory-cache-service"

class ServerlessFactory {
    private cacheServiceVal: CacheService | undefined
    private sessionServiceVal: SessionService | undefined
    private clientInfoServiceVal: ClientInfoService | undefined

    cacheService(): CacheService {
        if (!this.cacheServiceVal) {
            this.cacheServiceVal = new MemoryCacheService()
        }
        return this.cacheServiceVal
    }

    sessionService(): SessionService {
        if (!this.sessionServiceVal) {
            this.sessionServiceVal = new SessionServiceLogic(this.cacheService())
        }
        return this.sessionServiceVal
    }

    clientInfoService(): ClientInfoService {
        if (!this.clientInfoServiceVal) {
            this.clientInfoServiceVal = new ClientInfoServiceLogicExpress()
        }
        return this.clientInfoServiceVal
    }
}

export const serverlessFactory = new ServerlessFactory()
