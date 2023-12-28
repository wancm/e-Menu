import { GLOBAL_CONSTANTS } from "@libs/global-constants"
import { getLocalData } from "@libs/shared/types/services/app-http-client"
import { AppDateUtil } from "@libs/shared/utils/app-date-util"

export class AppSettings {
    private isProdVal: boolean | undefined

    // default value 01/01/1970 00:00:00. Same as C#
    private readonly defaultDateVal: Date = new Date(1970, 0, 1, 0, 0, 0, 0)

    private static instanceVal: AppSettings

    /**
     * @returns true if ENVIRONMENT === 'prod'
     */
    get isProd(): boolean {
        if (this.isProdVal !== undefined) return this.isProdVal

        if (AppSettings.isServer) {
            this.isProdVal = process.env.ENVIRONMENT === "prod"
        }

        return this.isProdVal ?? true
    }

    get defaultDate(): Date {
        return this.defaultDateVal
    }

    static get isServer(): boolean {
        return typeof window === "undefined"
    }

    static get instance(): AppSettings {
        if (this.instanceVal) return this.instanceVal
        if (this.isServer) this.instanceVal || (this.instanceVal = new this())
        return this.instanceVal || (this.instanceVal = new this())
    }

    static async startup(): Promise<void> {
        const data = await getLocalData<AppSettings>()
        this.instanceVal = data.data ?? new AppSettings()
    }

    public readonly systemId = "653e5a8d41ed3eaa02c42f8b"

    constructor() {}
}

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest

    describe("# app-util.ts", () => {
        const test1 = ".isProd"
        test.concurrent(test1, async () => {
            console.time(test1)

            expect(AppSettings.isServer).toBeTruthy()
            expect(AppSettings.instance).toBeDefined()
            expect(AppSettings.instance.isProd).toBeFalsy()
            expect(AppSettings.instance).toBeDefined()

            console.timeEnd(test1)
        })

        const test2 = ".defaultDate"
        test.concurrent(test2, async () => {
            console.time(test2)

            const date = AppDateUtil.dateToDateNumeric(AppSettings.instance.defaultDate)
            expect(date > 0).toBeTruthy()

            console.timeEnd(test2)
        })
    })
}
