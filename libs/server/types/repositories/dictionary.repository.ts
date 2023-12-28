import { Dictionary } from "@libs/shared/types/dictionary"

export type DictionaryRepository = {
    loadDictionaryAsync(identifier: string): Promise<Dictionary | undefined>

    saveDictionaryAsync(dictionary: Dictionary): Promise<string>

    updateDictionaryWebContentAsync(
        identifier: string,
        key: string,
        content: string,
    ): Promise<number>
}
