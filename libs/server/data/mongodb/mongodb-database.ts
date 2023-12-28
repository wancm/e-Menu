import { AppSettings } from "@libs/app-settings"
import { Db } from "mongodb"
import { mongoDbClient } from "./mongodb-client"

class MongoDbDatabase {
    private readonly dbVal: Db

    get db(): Db {
        return this.dbVal
    }

    constructor() {
        if (AppSettings.instance.isProd) {
            this.dbVal = mongoDbClient.db(process.env.MONGO_DB_NAME)
        } else {
            // we are in vitest unit test context now
            // use *_test db
            this.dbVal = mongoDbClient.db(process.env.MONGO_DB_NAME_UNIT_TEST)
        }
    }
}

export const appMongodb = new MongoDbDatabase()

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async () => {})

    describe("#mongodb-database", () => {
        //
        const test1 = "new MongoDbDatabase()"
        test(
            test1,
            async () => {
                const appMongodb = new MongoDbDatabase()
                expect(appMongodb).toBeDefined()
            },
            12000,
        )
    })
}
