import { appMongodb } from "@libs/server/data/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "@libs/server/data/mongodb/mongodb_const"
import { GeneralConverter } from "@libs/server/data/repositories/general-converter"
import { AppSettings } from "@libs/server/types/app-settings"
import { MasterDataRepository } from "@libs/server/types/repositories/master-data-repository"
import { Country } from "@libs/shared/types/country"
import { Collection } from "mongodb"
import "@libs/shared/extension-methods"

export class MongodbMasterDataRepository implements MasterDataRepository {
    private isStartup = false

    private readonly COUNTRIES_MASTER_DATA_IDENTIFIER: string = "countries-master-data"
    private readonly APP_SETTINGS_IDENTIFIER: string = "app-settings"

    private masterDataCollection: Collection<any>

    constructor() {
        this.masterDataCollection = appMongodb.db.collection(
            MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA,
        )
    }

    async startupAsync(): Promise<void> {
        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections.findIndex((c) =>
            c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA),
        )

        if (colIndexFound < 0) {
            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA} db collection created`)

            // create indexes

            // identifier_asc
            const indexCreatedResult = await this.masterDataCollection.createIndex(
                {
                    identifier: 1,
                },
                { name: "identifier_asc" },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA} db collection indexes created: ${indexCreatedResult} `,
            )
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadCountriesAsync(): Promise<Country[]> {
        const query = { identifier: this.COUNTRIES_MASTER_DATA_IDENTIFIER }

        const result = await this.masterDataCollection.findOne(query)

        if (result) {
            return result.countries
        }

        return []
    }

    async saveCountriesAsync(countries: Country[]): Promise<string> {
        const options = {
            projection: { _id: 0 },
        }
        const query = { identifier: this.COUNTRIES_MASTER_DATA_IDENTIFIER }

        const found = await this.masterDataCollection.findOne(query, options)

        if (found) throw new Error(`${this.COUNTRIES_MASTER_DATA_IDENTIFIER} document existed`)

        const result = await this.masterDataCollection.insertOne({
            identifier: this.COUNTRIES_MASTER_DATA_IDENTIFIER,
            countries,
        })

        return result.insertedId.toHexString()
    }

    async loadAppSettingsAsync(): Promise<AppSettings | undefined> {
        const query = { identifier: this.APP_SETTINGS_IDENTIFIER }

        const result = await this.masterDataCollection.findOne(query)

        if (result) {
            return GeneralConverter.toDto(result)
        }

        return {} as AppSettings
    }

    async saveAppSettingsAsync(settings: AppSettings): Promise<string> {
        const options = {
            projection: { _id: 0 },
        }

        const result = await this.masterDataCollection.insertOne(settings)

        return result.insertedId.toHexString()
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    const masterDataRepository = new MongodbMasterDataRepository()

    beforeEach(async (context) => {
        await masterDataRepository.startupAsync()
    })

    describe("#master-data-repositories.ts", () => {
        const test1 = ".loadCountries()"
        test(test1, async () => {
            console.time(test1)

            const countries = await masterDataRepository.loadCountriesAsync()
            countries.forEach((country) => {
                expect(country).not.toBeUndefined()
            })

            console.timeEnd(test1)
        })
    })
}
