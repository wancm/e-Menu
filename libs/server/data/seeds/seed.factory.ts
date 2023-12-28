import { MongodbDictionaryRepository } from "@libs/server/data/repositories/mongodb-dictionary.repository"
import { MongodbMasterDataRepository } from "@libs/server/data/repositories/mongodb-master-data.repository"

class SeedFactory {
    dictionaryRepository: MongodbDictionaryRepository
    masterDataRepository: MongodbMasterDataRepository

    constructor() {
        this.dictionaryRepository = new MongodbDictionaryRepository()
        this.masterDataRepository = new MongodbMasterDataRepository()
    }

    async initAsync() {}
}

// https://stackoverflow.com/questions/40745153/es8-immediately-invoked-async-function-expression
;(async () => {
    await new SeedFactory().initAsync()
})().catch((err) => {
    console.error(err)
})

export const seedFactory = new SeedFactory()
