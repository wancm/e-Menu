import { MongodbDictionaryRepository } from "@libs/server/data/repositories/mongodb-dictionary.repository"
import { MongodbMasterDataRepository } from "@libs/server/data/repositories/mongodb-master-data.repository"
import { ClientInfo } from "@libs/server/types/clilent-info"
import { DictionaryRepository } from "@libs/server/types/repositories/dictionary.repository"
import { MasterDataRepository } from "@libs/server/types/repositories/master-data-repository"
import { CacheService } from "@libs/server/types/services/cache.service"
import { ClientInfoService } from "@libs/server/types/services/client-info.service"
import { MemoryCacheService } from "@libs/shared/cache/memory-cache-service"
import { CONSTANTS } from "@libs/shared/constants"
import { Dictionary } from "@libs/shared/types/dictionary"
import { DictionaryService } from "@libs/shared/types/services/dictionary.service"
import { AppUtil } from "@libs/shared/utils/app-util"
import { ClientInfoServiceLogicExpress } from "../client-info/client-info-service.logic"

export class DictionaryServiceLogic implements DictionaryService {
    private readonly IDENTIFIER = "{language}-{level}"

    constructor(
        private cacheService: CacheService,
        private masterDataRepository: MasterDataRepository,
        private dictionaryRepository: DictionaryRepository,
        private clientInfoService: ClientInfoService,
    ) {}

    async loadDictionaryAsync(clientInfo: ClientInfo): Promise<Dictionary | undefined> {
        return await this.loadDictionaryWithParamsAsync(
            undefined,
            clientInfo?.countryCode,
            clientInfo?.preferredLanguages,
        )
    }

    async loadDictionaryWithParamsAsync(
        businessUnitId: string | undefined,
        countryCode: string | undefined,
        languages: string[] | undefined,
    ): Promise<Dictionary | undefined> {
        if (!languages || languages.length === 0) {
            languages = [await this.getCountryDefaultLanguageAsync(countryCode ?? "")]
        }

        for (let i = 0; i < languages.length; i++) {
            const key = `DICTIONARY-${languages[i]}-${countryCode}-${businessUnitId ?? ""}`
            const cache = await this.cacheService.tryGetAsync<Dictionary>(key)
            if (cache) {
                if ((cache as any) === CONSTANTS.CACHE_DATA_NULL) continue
                return cache
            }

            const dictionary = await this.loadAsync(
                businessUnitId ?? "",
                countryCode ?? "",
                languages[i],
            )
            await this.cacheService.trySetAsync(key, dictionary ?? CONSTANTS.CACHE_DATA_NULL)

            if (dictionary) {
                return dictionary
            }
        }

        return undefined
    }

    private async getCountryDefaultLanguageAsync(countryCode: string): Promise<string> {
        const key = `APP-SETTINGS-COUNTRY_${countryCode}-DEFAULT-LANGUAGE`
        let defaultLanguage = this.cacheService.tryGetAsync<string>(key)

        if (defaultLanguage) return defaultLanguage

        const appSettings = await this.masterDataRepository.loadAppSettingsAsync()

        if (!appSettings?.countriesSettings || appSettings.countriesSettings.length == 0)
            // we have no other choice but to return 'en' language
            return CONSTANTS.EN

        // try read default language by exact match of country code
        const countrySettings = appSettings.countriesSettings.find((c: { countryCode: string }) =>
            c.countryCode.isEqual(countryCode),
        )

        if (countrySettings?.defaultLanguage) {
            await this.cacheService.trySetAsync(key, countrySettings.defaultLanguage)
            return countrySettings.defaultLanguage
        }

        // try read the default language by country code === 'default'
        const defaultSettings = appSettings.countriesSettings.find((c: { countryCode: string }) =>
            c.countryCode.isEqual(CONSTANTS.DEFAULT),
        )

        if (defaultSettings?.defaultLanguage) {
            await this.cacheService.trySetAsync(key, defaultSettings.defaultLanguage)
            return defaultSettings.defaultLanguage
        }

        await this.cacheService.trySetAsync(key, CONSTANTS.EN)
        // we have no other choice but to return 'en' language
        return CONSTANTS.EN
    }

    private async loadAsync(
        businessUnitId: string,
        countryCode: string,
        language: string,
    ): Promise<Dictionary | undefined> {
        // load by language code to get the default dictionary. ex: en
        const dictionary = await this.dictionaryRepository.loadDictionaryAsync(
            language.toLowerCase(),
        )

        if (!dictionary) return undefined

        // try override by country level. ex: en-MY
        const countryKey = this.IDENTIFIER.replace("{language}", language).replace(
            "{level}",
            countryCode,
        )

        const countryDictionary = await this.dictionaryRepository.loadDictionaryAsync(countryKey)

        if (countryDictionary?.web?.contents) {
            this.dictWebContentsOverridden(dictionary, countryDictionary)
        }

        // try override by unit level. ex: en-@libsbusinessUnitId
        const unitKey = this.IDENTIFIER.replace("{language}", language).replace(
            "{level}",
            businessUnitId,
        )

        const unitDictionary = await this.dictionaryRepository.loadDictionaryAsync(unitKey)

        if (unitDictionary?.web?.contents) {
            this.dictWebContentsOverridden(dictionary, unitDictionary)
        }

        return dictionary
    }

    private dictWebContentsOverridden(ori: Dictionary, lookForPropToOverridden: Dictionary) {
        ori.web.contents.forEach((content) => {
            // try get override-able content
            const found = lookForPropToOverridden.web.contents.find((c) =>
                c.key.isEqual(content.key),
            ) as any

            // if overridden content is available
            if (found) {
                // override the properties if applicable
                this.objPropOverridden(content, found)
            }
        })
    }

    private objPropOverridden(obj: any, objToCheckForOverrideableProp: any) {
        Object.keys(obj).forEach((key: string) => {
            if (key === "key") return

            // if property is an object type
            if (AppUtil.isObject(objToCheckForOverrideableProp[key])) {
                // recursive loop to check for override-able property
                this.objPropOverridden(obj[key], objToCheckForOverrideableProp[key])
            } else {
                // if overridden prop available
                if (!AppUtil.isNil(objToCheckForOverrideableProp[key])) {
                    // override the property
                    obj[key] = objToCheckForOverrideableProp[key]
                }
            }
        })
    }

    updateContentAsync(
        businessUnitId: string | undefined,
        countryCode: string | undefined,
        language: string | undefined,
        key: string,
        content: string,
    ): Promise<number> {
        throw new Error("Method not implemented.")
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async (context) => {})

    describe("Dictionary load test", () => {
        const test1 = ".loadAsync()"
        test(
            test1,
            async () => {
                console.time(test1)

                const cacheService = new MemoryCacheService()

                const masterDataRepo = new MongodbMasterDataRepository()
                await masterDataRepo.startupAsync()

                const dictionaryRepo = new MongodbDictionaryRepository()
                await dictionaryRepo.startupAsync()

                const service = new DictionaryServiceLogic(
                    cacheService,
                    masterDataRepo,
                    dictionaryRepo,
                    new ClientInfoServiceLogicExpress(),
                )

                const dictionary = await service //
                    .loadDictionaryWithParamsAsync("@libstest-id", "MY", ["zh", "en"])

                expect(
                    dictionary?.web?.contents?.find((c) => c.key === "f-home-name")?.form?.rules
                        ?.required,
                ).toBeFalsy()

                const dictionary2 = await service.loadDictionaryWithParamsAsync(
                    "@libstest-id",
                    "MY",
                    ["zh", "en"],
                )
                expect(
                    dictionary2?.web?.contents?.find((c) => c.key === "f-home-name")?.form?.rules
                        ?.required,
                ).toBeFalsy()

                console.timeEnd(test1)
            },
            1200000,
        )
    })
}
