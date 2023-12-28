import "dotenv/config"
import { MongoClient } from "mongodb"

// Replace the uri string with your connection string.
const uri = process.env.MONGO_DB_ATLAS_URI as string

export const mongoDbClient = new MongoClient(uri)

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async () => {})

    describe("#MongoClient", () => {
        //
        const test1 = "check if null or undefined: process.env.MONGO_DB_ATLAS_URI"
        test(test1, async () => {
            // Replace the uri string with your connection string.
            const uri = process.env.MONGO_DB_ATLAS_URI as string
            expect(uri).toBeDefined()
            expect(uri).not.toBeNull()
        })

        const test2 = "new MongoClient(uri)"
        test(test2, async () => {
            // Replace the uri string with your connection string.
            const uri = process.env.MONGO_DB_ATLAS_URI as string
            const mongoDbClient = new MongoClient(uri)

            expect(mongoDbClient).toBeDefined()
        })
    })
}
