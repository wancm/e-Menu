import { MongodbBusinessUnitsRepository } from "@libs/server/data/repositories/mongodb-business-units.repository"
import { MongodbDictionaryRepository } from "@libs/server/data/repositories/mongodb-dictionary.repository"
import { MongodbMasterDataRepository } from "@libs/server/data/repositories/mongodb-master-data.repository"
import { MongoDbPersonRepository } from "@libs/server/data/repositories/mongodb-person-repository"
import { ClientInfoServiceLogicExpress } from "@libs/server/logic/client-info/client-info-service.logic"
import { DictionaryServiceLogic } from "@libs/server/logic/dictionary/dictionary-service.logic"
import { SessionServiceLogic } from "@libs/server/logic/sessions/session-service-logic"
import { BusinessUnitsRepository } from "@libs/server/types/repositories/business-units-repository"
import { DictionaryRepository } from "@libs/server/types/repositories/dictionary.repository"
import { MasterDataRepository } from "@libs/server/types/repositories/master-data-repository"
import { CacheService } from "@libs/server/types/services/cache.service"
import { ClientInfoService } from "@libs/server/types/services/client-info.service"
import { SessionService } from "@libs/server/types/services/session-service"
import { MemoryCacheService } from "@libs/shared/cache/memory-cache-service"
import { DictionaryService } from "@libs/shared/types/services/dictionary.service"

class Factory {
    private cacheServiceVal: MemoryCacheService | undefined
    private sessionServiceVal: SessionServiceLogic | undefined
    private dictionaryServiceVal: DictionaryServiceLogic | undefined
    private clientInfoServiceVal: ClientInfoServiceLogicExpress | undefined

    private personRepositoryVal: MongoDbPersonRepository | undefined
    private businessUnitRepositoryVal: MongodbBusinessUnitsRepository | undefined
    private masterDataRepositoryVal: MongodbMasterDataRepository | undefined
    private dictionaryRepositoryVal: MongodbDictionaryRepository | undefined

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

    dictionaryService(): DictionaryService {
        if (!this.dictionaryServiceVal) {
            this.dictionaryServiceVal = new DictionaryServiceLogic(
                this.cacheService(),
                this.masterDataRepository(),
                this.dictionaryRepository(),
                this.clientInfoService(),
            )
        }
        return this.dictionaryServiceVal
    }

    businessUnitRepository(): BusinessUnitsRepository {
        if (!this.businessUnitRepositoryVal) {
            this.businessUnitRepositoryVal = new MongodbBusinessUnitsRepository()
        }
        return this.businessUnitRepositoryVal
    }

    masterDataRepository(): MasterDataRepository {
        if (!this.masterDataRepositoryVal) {
            this.masterDataRepositoryVal = new MongodbMasterDataRepository()
        }
        return this.masterDataRepositoryVal
    }

    dictionaryRepository(): DictionaryRepository {
        if (!this.dictionaryRepositoryVal) {
            this.dictionaryRepositoryVal = new MongodbDictionaryRepository()
        }
        return this.dictionaryRepositoryVal
    }
}

export const factory = new Factory()
