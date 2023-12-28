import { AppSettings } from "@libs/app-settings"
import { appMongodb } from "@libs/server/data/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "@libs/server/data/mongodb/mongodb_const"
import { MongodbMasterDataRepository } from "@libs/server/data/repositories/mongodb-master-data.repository"
import { BusinessUnitsRepository } from "@libs/server/types/repositories/business-units-repository"
import {
    BusinessUnit,
    businessUnitConverter,
    BusinessUnitEntity,
} from "@libs/shared/types/business-unit"
import { testHelper } from "@libs/shared/utils/test-helper"
import { Collection, ObjectId } from "mongodb"
import "@libs/shared/extension-methods"

export class MongodbBusinessUnitsRepository implements BusinessUnitsRepository {
    private isStartup = false
    private businessUnitCollection: Collection<BusinessUnitEntity>

    constructor() {
        this.businessUnitCollection = appMongodb.db.collection(
            MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS,
        )
    }

    async startupAsync(): Promise<void> {
        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections.findIndex((c) =>
            c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS),
        )

        if (colIndexFound < 0) {
            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection created`)

            // create indexes

            // identifier_asc
            const indexCreatedResult = await this.businessUnitCollection.createIndex(
                {
                    name: 1,
                },
                { name: "name_asc", unique: true },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection indexes created: ${indexCreatedResult} `,
            )

            const indexCreatedResult2 = await this.businessUnitCollection.createIndex(
                {
                    createdDate: -1,
                },
                { name: "createdDate_desc" },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection indexes created: ${indexCreatedResult2} `,
            )
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadOneAsync(id: string): Promise<BusinessUnit> {
        const query = { _id: new ObjectId(id) }

        let doc = await this.businessUnitCollection.findOne(query)
        return businessUnitConverter.toDTO(doc as BusinessUnitEntity)
    }

    async loadManyAsync(ids: string[]): Promise<BusinessUnit[]> {
        const query = {
            _id: { $in: ids.map((id) => new ObjectId(id)) },
        }

        const cursor = this.businessUnitCollection.find(query)

        const businessUnits: BusinessUnit[] = []
        for await (const doc of cursor) {
            businessUnits.push(businessUnitConverter.toDTO(doc))
        }

        return businessUnits
    }

    async saveAsync(businessUnit: BusinessUnit, createdBy: string): Promise<string> {
        // convert entity: 5.513ms
        const entity = businessUnitConverter.toEntity(businessUnit, createdBy)

        // doc insert: 546.484ms
        const result = await this.businessUnitCollection.insertOne(entity)

        return result.insertedId.toHexString()
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    const businessUnitRepository = new MongodbBusinessUnitsRepository()
    const masterDataRepository = new MongodbMasterDataRepository()

    beforeEach(async () => {
        await masterDataRepository.startupAsync()
        await businessUnitRepository.startupAsync()
    })

    describe("#Business unit repo CRUD test", () => {
        //
        const test1 = ".saveAsync, loadOneAsync, loadManyAsync"
        test(
            test1,
            async () => {
                console.time(test1)

                const countryCode = "MY"

                let countries = await masterDataRepository.loadCountriesAsync()
                const malaysia = countries.find((c) => c.code.isEqual(countryCode))

                const mockBusinessUnit = async () => {
                    return {
                        name: testHelper.generateRandomString(10),
                    }
                }

                const mock = await mockBusinessUnit()
                const objId = await businessUnitRepository.saveAsync(
                    mock,
                    AppSettings.instance.systemId,
                )
                const objId2 = await businessUnitRepository.saveAsync(
                    await mockBusinessUnit(),
                    AppSettings.instance.systemId,
                )

                const businessUnit = await businessUnitRepository.loadOneAsync(objId)
                expect(businessUnit.name).equals(mock.name)

                const businessUnits = await businessUnitRepository.loadManyAsync([objId, objId2])
                expect(businessUnits[0].id).equals(objId)
                expect(businessUnits[1].id).equals(objId2)

                console.timeEnd(test1)
            },
            12000,
        )
    })
}
