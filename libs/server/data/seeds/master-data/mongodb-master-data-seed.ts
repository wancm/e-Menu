import commonCurrency from "@libs/server/data/common-currency.json"
import { MongodbMasterDataRepository } from "@libs/server/data/repositories/mongodb-master-data.repository"
import { Country } from "@libs/shared/types/country"
import countryByAbbreviation from "country-json/src/country-by-abbreviation.json"
import countryByCallingCode from "country-json/src/country-by-calling-code.json"
import countryByCurrencyCode from "country-json/src/country-by-currency-code.json"
import fs from "fs/promises"
import path from "path"

/* c8 ignore start */

export class MongodbMasterDataSeed {
    constructor(private masterDataRepository: MongodbMasterDataRepository) {}

    async runAsync(dataPath?: string): Promise<void> {
        await this.seedAppSettingsAsync(dataPath)
        await this.seedCountriesMasterDataAsync()
    }

    private async seedAppSettingsAsync(dataPath?: string) {
        if (!dataPath) dataPath = "./data"

        const appSettings = await this.masterDataRepository.loadAppSettingsAsync()
        if (appSettings?.app) return

        const dirname = path.join(__dirname, dataPath)
        const files = await fs.readdir(dirname)

        for (const file of files) {
            const filePath = path.join(dirname, file)
            // https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs
            const content = await fs.readFile(filePath, "utf8")
            const appSettings = JSON.parse(content)

            await this.masterDataRepository.saveAppSettingsAsync(appSettings)
        }
    }

    private loadCountriesMasterDataFromCountryJs(): Country[] {
        const countries: Country[] = []

        countryByAbbreviation.forEach((country) => {
            const countryEntity: Country = {
                code: country.abbreviation,
                name: country.country,
            }

            const callingCode = countryByCallingCode.find((c) => c.country === country.country)

            if (callingCode) countryEntity.callingCode = callingCode.calling_code

            const currencyCode = countryByCurrencyCode.find((c) => c.country === country.country)

            if (currencyCode?.currency_code) {
                const currencyCodeStr = currencyCode.currency_code.trim().toUpperCase()
                if ((commonCurrency as any)[currencyCodeStr]) {
                    const currency = (commonCurrency as any)[currencyCodeStr]
                    countryEntity.currency = {
                        code: currencyCodeStr,
                        minorUnit: currency.decimal_digits,
                        symbol: currency.symbol,
                        name: currency.name,
                        symbolNative: currency.symbol_native,
                        namePlural: currency.name_plural,
                    }
                }
            }

            countries.push(countryEntity)
        })

        return countries
    }

    private async seedCountriesMasterDataAsync(): Promise<void> {
        const countries = await this.masterDataRepository.loadCountriesAsync()
        if (countries && countries.length > 0) return

        const loadedCountries = this.loadCountriesMasterDataFromCountryJs()
        await this.masterDataRepository.saveCountriesAsync(loadedCountries)
    }
}

export const mongodbMasterDataSeed = new MongodbMasterDataSeed(new MongodbMasterDataRepository())

/* c8 ignore end */

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async (context) => {})

    describe("#mongo db master data seeding", () => {
        const test1 = ".runAsync()"
        test(test1, async () => {
            console.time(test1)

            const repo = new MongodbMasterDataRepository()
            await repo.startupAsync()

            const seed = new MongodbMasterDataSeed(repo)
            await seed.runAsync()

            console.timeEnd(test1)
        })
    }, 60000)
}
