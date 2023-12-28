import { MongodbDictionaryRepository } from "@libs/server/data/repositories/mongodb-dictionary.repository"
import { Dictionary } from "@libs/shared/types/dictionary"
import fs from "fs/promises"
import path from "path"

export class MongodbDictionarySeed {
    constructor(private dictionaryRepository: MongodbDictionaryRepository) {}

    async runAsync(dataPath?: string): Promise<number> {
        if (!dataPath) dataPath = "./data"

        let count = 0

        try {
            const dirname = path.join(__dirname, dataPath)
            const files = await fs.readdir(dirname)
            for (const file of files) {
                const filePath = path.join(dirname, file)
                // https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs
                const content = await fs.readFile(filePath, "utf8")
                const dictionary = JSON.parse(content) as Dictionary

                const found = await this.dictionaryRepository.loadDictionaryAsync(
                    dictionary.identifier,
                )
                if (!found) {
                    count++
                    await this.dictionaryRepository.saveDictionaryAsync(dictionary)
                }
            }
        } catch {
            count = -1
        }

        return count
    }
}

export const mongodbDictionarySeed = new MongodbDictionarySeed(new MongodbDictionaryRepository())

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async (context) => {})

    describe("#mongodb-dictionary-mongodb-master-data-seed.ts", () => {
        const test1 = ".run()"
        test(
            test1,
            async () => {
                console.time(test1)

                const repo = new MongodbDictionaryRepository()
                await repo.startupAsync()

                const seed = new MongodbDictionarySeed(repo)
                const result = await seed.runAsync()

                expect(result > -1).toBeTruthy()

                console.timeEnd(test1)
            },
            60000,
        )
    })
}
