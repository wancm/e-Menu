import { NullableString } from "@libs/shared/types/types"
import { AppUtil } from "@libs/shared/utils/app-util"
import { ObjectId } from "mongodb"

declare global {
    interface String {
        toObjectId(): ObjectId
    }
}

export class MongoDbUtil {
    /**
     * Generate instance of mongoDb ObjectId
     */
    static genId(id?: NullableString): ObjectId {
        return !AppUtil.isStrEmpty(id) ? new ObjectId(id) : new ObjectId()
    }

    /**
     * Generate instance of mongoDb ObjectId
     * @return ObjectId
     * @return null if @id is nil or empty
     */
    static genIdIfNotNil(id?: NullableString): ObjectId | null {
        return !AppUtil.isStrEmpty(id) ? new ObjectId(id) : null
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
