import { AppSettings } from "@libs/app-settings"
import { appMongodb } from "@libs/server/data/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "@libs/server/data/mongodb/mongodb_const"
import { MongodbMasterDataRepository } from "@libs/server/data/repositories/mongodb-master-data.repository"
import { ShopsRepository } from "@libs/server/types/repositories/shops-repository"
import { Shop, shopConverter, ShopEntity } from "@libs/shared/types/shop"
import { testHelper } from "@libs/shared/utils/test-helper"
import { Collection, ObjectId, SortDirection } from "mongodb"
import "@libs/shared/extension-methods"

export class MongoDbShopsRepository implements ShopsRepository {
    private isStartup = false
    private shopCollection: Collection<ShopEntity>

    constructor() {
        this.shopCollection = appMongodb.db.collection(MONGO_DB_CONSTANT.COLLECTION_SHOPS)
    }

    async startupAsync(): Promise<void> {
        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections.findIndex((c) =>
            c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_SHOPS),
        )

        if (colIndexFound < 0) {
            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_SHOPS)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection created`)

            // create indexes

            // identifier_asc
            const indexCreatedResult = await this.shopCollection.createIndex(
                {
                    businessUnitId: 1,
                },
                { name: "businessUnitId_asc" },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult} `,
            )

            const indexCreatedResult2 = await this.shopCollection.createIndex(
                {
                    name: 1,
                },
                { name: "name_asc" },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult2} `,
            )

            const indexCreatedResult3 = await this.shopCollection.createIndex(
                {
                    createdDate: -1,
                },
                { name: "createdDate_desc" },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult3} `,
            )

            const indexCreatedResult4 = await this.shopCollection.createIndex(
                {
                    name: "text",
                    "address.line1": "text",
                    "address.line2": "text",
                    "address.line3": "text",
                    "address.state": "text",
                    "address.city": "text",
                    "address.countryCode": "text",
                },
                { name: "name_text" },
            )

            console.log(
                `${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult4} `,
            )
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadOneAsync(objId: ObjectId): Promise<Shop> {
        const query = { _id: objId }

        const doc = await this.shopCollection.findOne(query)
        return shopConverter.toDTO(doc as ShopEntity)
    }

    async loadByBusinessUnitIdAsync(businessUnitId: ObjectId): Promise<Shop[]> {
        // define an query document
        const query = {
            businessUnitId,
        }

        // https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/sort/
        // sort in descending (-1) order by
        const dir: SortDirection = "asc"
        const sort = { name: dir }

        const cursor = this.shopCollection.find(query).sort(sort)

        const shops: Shop[] = []
        for await (const doc of cursor) {
            shops.push(shopConverter.toDTO(doc))
        }

        return shops
    }

    async saveAsync(shop: Shop, createdBy: string): Promise<ObjectId> {
        // convert entity: 5.513ms
        const entity = shopConverter.toEntity(shop, createdBy)

        // doc insert: 546.484ms
        const result = await this.shopCollection.insertOne(entity)

        return result.insertedId
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    const masterDataRepository = new MongodbMasterDataRepository()
    const shopRepository = new MongoDbShopsRepository()

    beforeEach(async (context) => {
        await masterDataRepository.startupAsync()
        await shopRepository.startupAsync()
    })

    describe("#shop-repositories.ts", () => {
        const test1 = ".saveAsync, loadOneAsync, loadManyAsync"
        test(
            test1,
            async () => {
                console.time(test1)

                const businessUnitId = new ObjectId().toHexString()

                const personId = new ObjectId().toHexString()
                const personId2 = new ObjectId().toHexString()

                const mock = async () => {
                    return {
                        name: testHelper.generateRandomString(10),
                        businessUnitId,
                        persons: [personId, personId2],
                        address: {
                            countryCode: "MY",
                        },
                    }
                }

                const objId = await shopRepository.saveAsync(
                    await mock(),
                    AppSettings.instance.systemId,
                )

                const objId2 = await shopRepository.saveAsync(
                    await mock(),
                    AppSettings.instance.systemId,
                )

                const shop = await shopRepository.loadOneAsync(objId)

                const shops = await shopRepository.loadByBusinessUnitIdAsync(
                    new ObjectId(businessUnitId),
                )

                expect(shop.id).equals(objId.toHexString())
                expect(shops.filter((s) => s.id?.isEqual(objId.toHexString()))).not.toBeNull()
                expect(shops.filter((s) => s.id?.isEqual(objId2.toHexString()))).not.toBeNull()

                console.timeEnd(test1)
            },
            120000,
        )
    })
}
