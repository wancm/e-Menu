import { CONSTANTS } from "@libs/shared/constants"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export class AppDateUtil {
    static dateDiffInDays(date1Str: string, date2Str: string) {
        const date1 = dayjs(date1Str)
        const date2 = dayjs(date2Str)
        return date1.diff(date2, "day")
    }

    static dateDiffInDaysPositive(date1Str: string, date2Str: string) {
        const days = this.dateDiffInDays(date1Str, date2Str)
        return days > 0 ? days : days * -1
    }

    /**
     * @param dateStr YYYY-MM-DD or YYYYMMDD
     */
    static dateStrToDateTuple(dateStr: string): [year: number, monthIndex: number, date: number] {
        if (dateStr.length != 8 && dateStr.length != 10)
            throw new Error(`Invalid date str. ${dateStr}`)

        if (dateStr.length == 10) {
            dateStr = dateStr.replaceAll("-", "")
        }

        return [
            parseInt(dateStr.substring(0, 4)),
            parseInt(dateStr.substring(4, 6)) - 1,
            parseInt(dateStr.substring(6, 8)),
        ]
    }

    static dateNumericToDateFormat(dateNumeric: number): string {
        const str = dateNumeric.toString()
        return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`
    }

    static dateNumericToDate(dateNumeric: number): Date {
        const dateStr = this.dateNumericToDateFormat(dateNumeric)
        const tuple = this.dateStrToDateTuple(dateStr)
        return new Date(tuple[0], tuple[1], tuple[2])
    }

    static utcNowToDate(): Date {
        // 'YYYY-MM-DD'
        return dayjs.utc().toDate()
    }

    static utcNowToDateStr(): string {
        // 'YYYY-MM-DD'
        return dayjs.utc().format(CONSTANTS.DATE_FORMAT)
    }

    static utcNowUnixMilliseconds(): number {
        // 'YYYY-MM-DD'
        return dayjs.utc().valueOf()
    }

    static unixMillisecondsToDayStr(milliseconds: number) {
        return dayjs(milliseconds).format(CONSTANTS.DATE_FORMAT)
    }

    static unixMillisecondsToDate(milliseconds: number) {
        return dayjs(milliseconds).toDate()
    }

    static offsetUtcNowToDateNumeric(
        timeZoneUtcOffsetHours: number = 0,
        timeZoneUtcOffsetMinutes: number = 0,
    ): number {
        const utc = dayjs.utc().add(timeZoneUtcOffsetHours, "h").add(timeZoneUtcOffsetMinutes, "m")

        const date = utc.date()
        const month = utc.month()
        const year = utc.year()

        return parseInt(`${year}${this.twoDigits(month + 1)}${this.twoDigits(date)}`)
    }

    private static twoDigits(d: number): string {
        return d < 10 ? "0" + d.toString() : d.toString()
    }

    static dateToDateNumeric(date: Date): number {
        return parseInt(
            `${date.getFullYear()}${this.twoDigits(date.getMonth() + 1)}${this.twoDigits(
                date.getDate(),
            )}`,
        )
    }

    /**
     * @param dateStr YYYY-MM-DD or YYYYMMDD
     */
    static dateStrToDateNumeric(dateStr: string): number {
        const tuple = this.dateStrToDateTuple(dateStr)
        return parseInt(`${tuple[0]}${this.twoDigits(tuple[1] + 1)}${this.twoDigits(tuple[2])}`)
    }

    /**
     * @param dateStr YYYY-MM-DD or YYYYMMDD
     */
    static dateStrToDate(dateStr: string): Date {
        return dayjs(dateStr).toDate()
    }

    /**
     * @param dateNumeric YYYYMMDD
     * @param daysToAdd number of days to add
     */
    static dateNumericAddDayToDateStr(dateNumeric: number, daysToAdd: number): string {
        return this.dateStrAddDayToDateStr(dateNumeric.toString(), daysToAdd)
    }

    /**
     * @param dateStr YYYY-MM-DD or YYYYMMDD
     * @param daysToAdd number of days to add
     */
    static dateStrAddDayToDateStr(dateStr: string, daysToAdd: number): string {
        const tuple = this.dateStrToDateTuple(dateStr)
        return this.dateNumberAddDayToDateStr(tuple[0], tuple[1], tuple[2], daysToAdd)
    }

    static dateNumberAddDayToDateStr(
        year: number,
        monthIndex: number,
        date: number,
        daysToAdd: number,
    ): string {
        const oriDate = new Date(year, monthIndex, date, 0, 0, 0, 0)

        return dayjs(oriDate).add(daysToAdd, "day").format(CONSTANTS.DATE_FORMAT)
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, vi, afterEach } = import.meta.vitest
    describe("#app-date-util.ts", () => {
        afterEach(() => {
            vi.restoreAllMocks()
        })

        const test1 = ".unixMillisecondsToDayStr() <=> .unixMillisecondsToDayStr()"
        test.concurrent(test1, async () => {
            console.time(test1)

            const unix = AppDateUtil.utcNowUnixMilliseconds()
            const dateStr = AppDateUtil.unixMillisecondsToDayStr(unix)

            expect(dateStr).toEqual(dayjs().format(CONSTANTS.DATE_FORMAT))

            console.timeEnd(test1)
        })

        const test2 = ".unixMillisecondsToDayStr() <=> .unixMillisecondsToDate()"
        test.concurrent(test2, async () => {
            console.time(test2)

            const unix = AppDateUtil.utcNowUnixMilliseconds()
            const timespan = unix + 120 * 1000

            const date = AppDateUtil.unixMillisecondsToDate(timespan)

            expect(
                AppDateUtil.dateNumericToDateFormat(AppDateUtil.dateToDateNumeric(date)),
            ).toEqual(dayjs().format(CONSTANTS.DATE_FORMAT))

            console.timeEnd(test2)
        })
    })
}
