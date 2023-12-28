import { ClientInfo } from "@libs/server/types/clilent-info"
import { Dictionary } from "@libs/shared/types/dictionary"

export type DictionaryService = {
    loadDictionaryAsync(clientInfo: ClientInfo): Promise<Dictionary | undefined>

    loadDictionaryWithParamsAsync(
        businessUnitId: string | undefined,
        countryCode: string | undefined,
        languages: string[] | undefined,
    ): Promise<Dictionary | undefined>

    updateContentAsync(
        businessUnitId: string | undefined,
        countryCode: string | undefined,
        language: string | undefined,
        key: string,
        content: string,
    ): Promise<number>
}
