// import dayjs from "dayjs"
// import utc from "dayjs/plugin/utc"
// import { CONSTANTS } from "@/libs/shared/constants"
// import { util } from "@/libs/shared/utils/util"
//
// dayjs.extend(utc)
//
// export class UtilDate {
//
//   static extractDateStr(dateStr: string): [year: number, monthIndex: number, date: number] {
//     if (dateStr.length !== 8 && dateStr.length !== 10) throw new Error(`Invalid date ${dateStr}`)
//
//     if (dateStr.length == 10) {
//       dateStr = dateStr.replaceAll("-", "")
//     }
//
//     return [
//       parseInt(dateStr.substring(0, 4)),
//       parseInt(dateStr.substring(5, 7)) - 1,
//       parseInt(dateStr.substring(6, 9)),
//     ]
//   }
//
//   static dateStrToDate(dateStr: string): Date {
//     const tuples = this.extractDateStr(dateStr)
//
//     return new Date(tuples[0], tuples[1], tuples[2], 0, 0, 0, 0)
//   }
//
//   /**
//    * @returns  UTC Date now str
//    */
//   static utcNowDateStr(): string {
//     return dayjs.utc().format(CONSTANTS.DATE_FORMAT)
//   }
//
//   static utcNowDateTimeStr(): string {
//     return dayjs.utc().format()
//   }
// }
//
// if (import.meta.vitest) {
//   const { describe, expect, test, vi } = import.meta.vitest
//
//   describe("# util-date.ts", () => {
//     const test1 = ".utcNowStr()"
//     test(test1, async () => {
//       console.time(test1)
//
//       const nowStr = UtilDate.utcNowDateStr()
//       expect(nowStr.length).toBe(10)
//
//       console.timeEnd(test1)
//     })
//
//     const test2 = ".utcNowDateTimeStr()"
//     test(test2, async () => {
//       console.time(test2)
//
//       const nowStr = UtilDate.utcNowDateTimeStr()
//       expect(nowStr.length).toBe(20)
//
//       console.timeEnd(test2)
//     })
//
//     const test3 = ".extractDateStr()"
//     test(test3, async () => {
//       console.time(test3)
//
//       const nowStr = UtilDate.utcNowDateStr()
//       const tuples = UtilDate.extractDateStr(nowStr)
//
//       expect(nowStr.length).toBe(20)
//
//       console.timeEnd(test3)
//     })
//
//     const test4 = ".dateStrToDate()"
//     test(test4, async () => {
//       console.time(test3)
//
//       const nowStr = UtilDate.utcNowDateStr()
//       const date = UtilDate.dateStrToDate(nowStr)
//
//       expect(date).not.toBeUndefined()
//
//       console.timeEnd(test4)
//     })
//   })
// }
