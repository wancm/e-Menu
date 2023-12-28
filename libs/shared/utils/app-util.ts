import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { v4 as uuidv4 } from "uuid"

dayjs.extend(utc)

export class AppUtil {
    /**
     * Check if input is String type.
     * @return true if it's String type.
     * @return false if nil.
     */
    static isStr(val: unknown): val is string {
        if (this.isNil(val)) return false
        // https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
        return typeof val === "string" || val instanceof String
    }

    /**
     * Check if input is Number type.
     * @return true if it's Number type.
     * @return false if nil.
     */
    static isNumber(val: unknown): val is number {
        if (this.isNil(val)) return false
        // https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
        return typeof val === "number"
    }

    /**
     * Check if input is Boolean type.
     * @return true if it's Boolean type.
     * @return false if nil.
     */
    static isBoolean(val: unknown): val is boolean {
        if (this.isNil(val)) return false
        // https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
        return typeof val === "boolean"
    }

    /**
     * Check if input is Object type.
     * @return true if it's String type.
     * @return true if it's Array type.
     * @return false if nil.
     */
    static isObject(val: unknown): val is object {
        if (this.isNil(val)) return false
        // https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
        return typeof val === "object"
    }

    /**
     * Check if input is Object type.
     * @return true if it's object type.
     * @return false if nil.
     */
    static isDate(val: unknown): val is Date {
        if (this.isNil(val)) return false
        // https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
        if (val instanceof Date) return true
        const obj = val as any
        return typeof obj.getMonth === "function"
    }

    /**
     * Check if input is null or undefined.
     * @return true if it's undefined / null.
     */
    static isNil(val: unknown): val is null | undefined {
        // https://builtin.com/software-engineering-perspectives/javascript-null-check
        return val === undefined || val === null
    }

    /**
     * Check if input is nil or empty string.
     * @return false if not an empty string.
     * @return true if nil.
     */
    static isStrEmpty(val: unknown): val is null | undefined {
        if (this.isNil(val)) return true
        return val?.toString().trim().length === 0
    }

    /**
     * Check if array is nil or empty.
     * @returns true if input is an array.
     * @returns true if nil.
     * @error if input is not an array.
     */
    static isArrEmpty(arr: unknown): arr is null | undefined {
        if (this.isNil(arr)) return true
        if (!Array.isArray(arr)) throw Error("@arr is not an array")
        return arr.length === 0
    }

    /**
     * @returns empty string if input is null
     * @returns the input
     */
    static toNullString(val?: string | null | undefined): string {
        if (this.isStrEmpty(val)) return ""
        return val as string
    }

    static isObjectEmpty(val: any): boolean {
        if (!val) return true
        if (!this.isObject(val)) return true
        return Object.keys(val).length > 0
    }

    static mapSetJsonStringify(map: Map<string, any>): string {
        // https://www.youtube.com/watch?v=hubQQ3F337A

        return JSON.stringify(
            map,
            (_, value) => {
                if (value instanceof Map) {
                    return Object.fromEntries(value)
                }

                if (value instanceof Set) {
                    return Array.from(value)
                }

                return value
            },
            2,
        )
    }

    static mapSetJsonParse(json: string): Map<string, any> | Set<any> {
        // https://www.youtube.com/watch?v=hubQQ3F337A

        return JSON.parse(json, (_, value) => {
            if (Array.isArray(value)) {
                return new Set<any>(value)
            }

            if (value && typeof value === "object") {
                return new Map(Object.entries(value))
            }

            return value
        })
    }

    /**
     * Date without time equality comparison
     */
    static dateEqual(date1: Date, date2: Date): boolean {
        // https://stackoverflow.com/questions/1090815/how-to-clone-a-date-object
        const clone1 = new Date(date1.getTime())
        const clone2 = new Date(date2.getTime())

        clone1.setHours(0, 0, 0, 0)
        clone2.setHours(0, 0, 0, 0)
        // https://stackoverflow.com/questions/2698725/comparing-date-part-only-without-comparing-time-in-javascript
        return clone1.getTime() === clone2.getTime()
    }

    static delay(ms: number): Promise<void> {
        // https://stackoverflow.com/questions/37764665/how-to-implement-sleep-function-in-typescript
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    static genId(): string {
        return uuidv4()
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, vi } = import.meta.vitest

    describe("# app-util.ts", () => {
        const test1 = ".isNil()"
        test.concurrent(test1, async () => {
            console.time(test1)

            expect(AppUtil.isNil(undefined)).toBeTruthy()
            expect(AppUtil.isNil(null)).toBeTruthy()

            expect(AppUtil.isNil({})).toBeFalsy()
            expect(AppUtil.isNil(false)).toBeFalsy()
            expect(AppUtil.isNil(true)).toBeFalsy()
            expect(AppUtil.isNil("")).toBeFalsy()
            expect(AppUtil.isNil(0)).toBeFalsy()

            console.timeEnd(test1)
        })

        const test2 = ".isStrEmpty()"
        test.concurrent(test2, async () => {
            console.time(test2)

            const str: string = ""
            expect(AppUtil.isStrEmpty(str)).toBeTruthy()
            expect(AppUtil.isStrEmpty("")).toBeTruthy()
            expect(AppUtil.isStrEmpty("  ")).toBeTruthy()
            expect(AppUtil.isStrEmpty("     ")).toBeTruthy()
            expect(AppUtil.isStrEmpty(undefined)).toBeTruthy()
            expect(AppUtil.isStrEmpty(null)).toBeTruthy()

            expect(AppUtil.isStrEmpty("a")).toBeFalsy()
            expect(AppUtil.isStrEmpty(1)).toBeFalsy()
            expect(AppUtil.isStrEmpty(true)).toBeFalsy()

            console.timeEnd(test2)
        })

        const test3 = ".isArrEmpty()"
        test.concurrent(test2, async () => {
            console.time(test3)

            expect(AppUtil.isArrEmpty([1, 2, 3])).toBeFalsy()
            expect(AppUtil.isArrEmpty(["1", "2", 3])).toBeFalsy()
            expect(AppUtil.isArrEmpty(["1", 2, { a: "a" }])).toBeFalsy()

            expect(AppUtil.isArrEmpty([])).toBeTruthy()
            expect(AppUtil.isArrEmpty(null)).toBeTruthy()
            expect(AppUtil.isArrEmpty(undefined)).toBeTruthy()

            // https://stackoverflow.com/questions/74487468/how-to-write-a-unit-test-in-vitest-that-expects-an-error
            expect(() => AppUtil.isArrEmpty("")).toThrowError()
            expect(() => AppUtil.isArrEmpty(123)).toThrowError()
            expect(() => AppUtil.isArrEmpty(true)).toThrowError()

            console.timeEnd(test3)
        })

        const test4 = ".isStr()"
        test.concurrent(test4, async () => {
            console.time(test4)

            expect(AppUtil.isStr("")).toBeTruthy()
            expect(AppUtil.isStr("abc")).toBeTruthy()
            expect(AppUtil.isStr("null")).toBeTruthy()
            expect(AppUtil.isStr("undefined")).toBeTruthy()

            expect(AppUtil.isStr(null)).toBeFalsy()
            expect(AppUtil.isStr(undefined)).toBeFalsy()
            expect(AppUtil.isStr(123)).toBeFalsy()
            expect(AppUtil.isStr(true)).toBeFalsy()
            expect(AppUtil.isStr([])).toBeFalsy()
            expect(AppUtil.isStr(new Date())).toBeFalsy()
            expect(AppUtil.isStr({ a: 1 })).toBeFalsy()

            console.timeEnd(test4)
        })

        const test5 = ".isNumber()"
        test.concurrent(test5, async () => {
            console.time(test5)

            expect(AppUtil.isNumber(123)).toBeTruthy()
            expect(AppUtil.isNumber(123.45)).toBeTruthy()

            expect(AppUtil.isNumber(null)).toBeFalsy()
            expect(AppUtil.isNumber(undefined)).toBeFalsy()
            expect(AppUtil.isNumber("123")).toBeFalsy()
            expect(AppUtil.isNumber(true)).toBeFalsy()
            expect(AppUtil.isNumber([])).toBeFalsy()
            expect(AppUtil.isNumber(new Date())).toBeFalsy()
            expect(AppUtil.isNumber({ a: 1 })).toBeFalsy()

            console.timeEnd(test5)
        })

        const test6 = ".isBoolean()"
        test.concurrent(test6, async () => {
            console.time(test6)

            expect(AppUtil.isBoolean(true)).toBeTruthy()
            expect(AppUtil.isBoolean(false)).toBeTruthy()

            expect(AppUtil.isBoolean(null)).toBeFalsy()
            expect(AppUtil.isBoolean(undefined)).toBeFalsy()
            expect(AppUtil.isBoolean(123)).toBeFalsy()
            expect(AppUtil.isBoolean("123")).toBeFalsy()
            expect(AppUtil.isBoolean([])).toBeFalsy()
            expect(AppUtil.isBoolean(new Date())).toBeFalsy()
            expect(AppUtil.isBoolean({ a: 1 })).toBeFalsy()

            console.timeEnd(test6)
        })

        const test7 = ".isObject()"
        test.concurrent(test7, async () => {
            console.time(test7)

            expect(AppUtil.isObject({})).toBeTruthy()
            expect(AppUtil.isObject({ a: 1 })).toBeTruthy()
            expect(AppUtil.isObject(new Date())).toBeTruthy()
            expect(AppUtil.isObject([])).toBeTruthy()

            expect(AppUtil.isObject(null)).toBeFalsy()
            expect(AppUtil.isObject(undefined)).toBeFalsy()
            expect(AppUtil.isObject(123)).toBeFalsy()
            expect(AppUtil.isObject("123")).toBeFalsy()
            expect(AppUtil.isObject(true)).toBeFalsy()

            console.timeEnd(test7)
        })

        const test8 = ".isDate()"
        test.concurrent(test8, async () => {
            console.time(test8)

            expect(AppUtil.isDate(new Date())).toBeTruthy()

            const now = dayjs()
            expect(AppUtil.isDate(now.toDate())).toBeTruthy()

            expect(AppUtil.isDate(null)).toBeFalsy()
            expect(AppUtil.isDate(undefined)).toBeFalsy()
            expect(AppUtil.isDate(123)).toBeFalsy()
            expect(AppUtil.isDate("123")).toBeFalsy()
            expect(AppUtil.isDate(true)).toBeFalsy()
            expect(AppUtil.isDate([])).toBeFalsy()
            expect(AppUtil.isDate({ a: 1 })).toBeFalsy()

            console.timeEnd(test8)
        })

        const test12 = ".toNullString"
        test.concurrent(test12, async () => {
            console.time(test12)

            expect(AppUtil.toNullString(undefined)).toEqual("")
            expect(AppUtil.toNullString(null)).toEqual("")
            expect(AppUtil.toNullString("")).toEqual("")
            expect(AppUtil.toNullString("123")).toEqual("123")

            console.timeEnd(test12)
        })

        const test13 = ".mapJsonStringify <=> mapJsonParse"
        test.concurrent(test13, async () => {
            console.time(test13)

            const map = new Map()
            map.set("key1", "value1")
            map.set("key2", 123)
            map.set("key3", true)
            map.set("key4", new Date().toDateString())

            const json = AppUtil.mapSetJsonStringify(map)
            expect(json.length).toBeGreaterThan(0)

            const parseMap = AppUtil.mapSetJsonParse(json) as Map<string, any>
            parseMap.forEach((_, key: string) => {
                expect(map.has(key)).toBeTruthy()
                try {
                    expect(map.get(key)).toEqual(parseMap.get(key))
                } catch (err) {
                    console.error(key, map.get(key))
                }
            })

            console.timeEnd(test13)
        })

        const test14 = ".dateEqual"
        test.concurrent(test14, async () => {
            console.time(test14)

            const now = dayjs()
            const result = AppUtil.dateEqual(now.toDate(), new Date())
            expect(result).toBeTruthy()

            console.timeEnd(test14)
        })
    })
}
