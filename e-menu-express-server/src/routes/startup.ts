import { errorPromise } from "@/shared/err-promise"
import { MongodbBusinessUnitsRepository } from "@libs/server/data/repositories/mongodb-business-units.repository"
import { MongodbDictionaryRepository } from "@libs/server/data/repositories/mongodb-dictionary.repository"
import { MongodbMasterDataRepository } from "@libs/server/data/repositories/mongodb-master-data.repository"
import { MongoDbPersonRepository } from "@libs/server/data/repositories/mongodb-person-repository"
import { MongoDbProductRepository } from "@libs/server/data/repositories/mongodb-product-repository"
import { MongoDbShopsRepository } from "@libs/server/data/repositories/mongodb-shops-repository"
import { mongodbDictionarySeed } from "@libs/server/data/seeds/dictionaries/mongodb-dictionary-seed"
import { mongodbMasterDataSeed } from "@libs/server/data/seeds/master-data/mongodb-master-data-seed"
import express from "express"

const startupRouter = express.Router()

const mongodbBusinessUnitsRepository = new MongodbBusinessUnitsRepository()
const mongodbDictionaryRepository = new MongodbDictionaryRepository()
const mongodbMasterDataRepository = new MongodbMasterDataRepository()
const mongoDbPersonRepository = new MongoDbPersonRepository()
const mongoDbProductRepository = new MongoDbProductRepository()
const mongoDbShopsRepository = new MongoDbShopsRepository()

startupRouter.get("/", async (req, res, next) => {
    await errorPromise(req, res, next, async () => {
        await mongodbBusinessUnitsRepository.startupAsync()
        await mongodbDictionaryRepository.startupAsync()
        await mongodbMasterDataRepository.startupAsync()
        await mongoDbPersonRepository.startupAsync()
        await mongoDbProductRepository.startupAsync()
        await mongoDbShopsRepository.startupAsync()

        await mongodbMasterDataSeed.runAsync("../../libs/server/data/seeds/master-data/data")
        await mongodbDictionarySeed.runAsync("../../libs/server/data/seeds/dictionaries/data")

        res.send("Startup completed")
    })
})

export default startupRouter
