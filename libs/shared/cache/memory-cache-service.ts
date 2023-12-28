import { CacheService } from "@libs/server/types/services/cache.service"
import { AppDateUtil } from "@libs/shared/utils/app-date-util"
import { AppUtil } from "@libs/shared/utils/app-util"

type LocalCache = {
    expired: number
    data: any
}

export class MemoryCacheService implements CacheService {
    private readonly cacheExpiringInterval = 1000
    private readonly cacheMap = new Map<string, any>()

    constructor() {
        /* c8 ignore start */
        setInterval(async () => {
            await this.cacheExpiringAsync()
        }, this.cacheExpiringInterval)
        /* c8 ignore end */
    }

    async trySetAsync(key: string, data: any, ttl: number = -1): Promise<number> {
        try {
            let expired = this.getExpiryTimestamp(ttl)

            const cache: LocalCache = {
                expired,
                data: JSON.stringify(data),
            }

            this.cacheMap.set(key, cache)

            return 1

            /* c8 ignore start */
        } catch (err) {
            return -1
            /* c8 ignore end */
        }
    }

    async tryGetAsync<T>(key: string): Promise<T> {
        if (this.cacheMap.has(key)) {
            return JSON.parse((this.cacheMap.get(key) as LocalCache).data)
        }

        return undefined as T
    }

    async tryExpiredAsync(key: string): Promise<number> {
        try {
            if (this.cacheMap.has(key)) {
                this.cacheMap.delete(key)
                return 0
            }
            return -1
        } catch (err) {
            return -1
        }
    }

    async extendExpiryAsync(key: string, ttl: number = -1): Promise<number> {
        try {
            if (this.cacheMap.has(key)) {
                const data = await this.tryGetAsync<any>(key)
                if (data) {
                    await this.trySetAsync(key, data, ttl)
                    return 0
                }

                return -1
            }
            return -1
        } catch (err) {
            return -1
        }
    }

    private getExpiryTimestamp(ttl: number): number {
        if (ttl > 0) {
            const unix = AppDateUtil.utcNowUnixMilliseconds()
            return unix + ttl * 1000
        }
        return -1
    }

    private async cacheExpiringAsync(): Promise<void> {
        const func = async (value: LocalCache, key: string) => {
            if (value.expired > -1) {
                if (AppDateUtil.utcNowUnixMilliseconds() > value.expired) {
                    await this.tryExpiredAsync(key)
                    console.log(`'${key}' cache expired.`)
                }
            }
        }

        const run = async () => this.cacheMap.forEach(func)

        await run()
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest
    const memoryCacheService = new MemoryCacheService()

    beforeEach(async (_) => {})

    describe("#memory-cache.service.ts", () => {
        const test1 = ".trySetAsync <=> tryGetAsync"
        test.concurrent(test1, async () => {
            console.time(test1)

            const value = "value1"

            await memoryCacheService.trySetAsync(test1, value)

            expect(await memoryCacheService.tryGetAsync(test1)).toEqual(value)

            console.timeEnd(test1)
        })

        const test2 = ".trySetAsync expired"
        test.concurrent(test2, async () => {
            console.time(test2)

            const value = "value2"

            await memoryCacheService.trySetAsync(test2, value, 1)

            expect(await memoryCacheService.tryGetAsync(test2)).toEqual(value)

            await AppUtil.delay(2000)

            expect(await memoryCacheService.tryGetAsync(test2)).toBeUndefined()

            await memoryCacheService.trySetAsync(test2, value, 1)

            // extend 1 more sec
            memoryCacheService.extendExpiryAsync(test2, 2)

            await AppUtil.delay(1500)

            // expect the cache is still there after 1.5 sec
            expect(await memoryCacheService.tryGetAsync(test2)).not.toBeUndefined()

            console.timeEnd(test2)
        })

        const test3 = ".trySetAsync never expired"
        test.concurrent(test3, async () => {
            console.time(test3)

            const value = "value3"

            await memoryCacheService.trySetAsync(test3, value, -1)

            expect(await memoryCacheService.tryGetAsync(test3)).toEqual(value)

            await AppUtil.delay(2000)

            console.timeEnd(test3)
        })
    })
}
