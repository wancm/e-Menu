import { MongoDbUtil } from "@libs/server/data/mongodb/mongodb-util"
import { AppUtil } from "@libs/shared/utils/app-util"
import { ObjectId } from "mongodb"

declare global {
    interface String {
        toObjectId(): ObjectId
    }
}

String.prototype.toObjectId = function (): ObjectId {
    if (AppUtil.isStrEmpty(this)) return undefined as any
    return MongoDbUtil.genId(this.toString())
}

if (import.meta.vitest) {
    const { describe, expect, test, vi } = import.meta.vitest

    describe("# extension.ts", () => {
        const test5 = ".toObjectId()"
        test.concurrent(test5, async () => {
            console.time(test5)

            const objId = new ObjectId()

            const objId2 = objId.toHexString().toObjectId()

            expect(objId).toEqual(objId2)

            console.timeEnd(test5)
        })
    })
}
