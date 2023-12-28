import { appMongodb } from "@libs/server/data/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "@libs/server/data/mongodb/mongodb_const"
import { GeneralConverter } from "@libs/server/data/repositories/general-converter"
import { DictionaryRepository } from "@libs/server/types/repositories/dictionary.repository"
import { Dictionary } from "@libs/shared/types/dictionary"
import { Collection } from "mongodb"
import "@libs/shared/extension-methods"

export class MongodbDictionaryRepository implements DictionaryRepository {
    private isStartup = false
    private dictionaryCollection: Collection<any>

    constructor() {
        this.dictionaryCollection = appMongodb.db.collection(
            MONGO_DB_CONSTANT.COLLECTION_DICTIONARIES,
        )
    }

    async startupAsync(): Promise<void> {
        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections.findIndex((c) =>
            c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_DICTIONARIES),
        )

        if (colIndexFound < 0) {
            // --- create collection ------

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_DICTIONARIES)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_DICTIONARIES} db collection created`)

            // --- create indexes ------

            // identifier_asc
            const indexCreatedResult = await this.dictionaryCollection.createIndex(
                {
                    identifier: 1,
                },
                { name: "identifier_asc" },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_DICTIONARIES} db collection indexes created: ${indexCreatedResult} `,
            )
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadDictionaryAsync(identifier: string): Promise<Dictionary | undefined> {
        const query = { identifier }
        const doc = await this.dictionaryCollection.findOne(query)
        return GeneralConverter.toDto(doc)
    }

    async saveDictionaryAsync(dictionary: Dictionary): Promise<string> {
        const result = await this.dictionaryCollection.insertOne(dictionary)
        return result.insertedId.toHexString()
    }

    async updateDictionaryWebContentAsync(
        identifier: string,
        key: string,
        content: string,
    ): Promise<number> {
        throw new Error("Method not implemented.")
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    const dictionaryRepository = new MongodbDictionaryRepository()

    beforeEach(async (context) => {
        await dictionaryRepository.startupAsync()
    })

    describe("#Dictionary CRUD test", () => {
        const test1 = ".loadDictionaryAsync()"
        test(test1, async () => {
            console.time(test1)

            console.timeEnd(test1)
        })
    })
}
