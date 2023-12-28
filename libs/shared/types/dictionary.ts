export type DictionaryForm = {
    formControlName: string
    placeholder?: string
    hint?: string
    errors?: {
        validate?: string
        required?: string
        min?: string
        max?: string
        pattern?: string
    }
    rules?: {
        required?: boolean
        min?: number
        max?: number
        pattern?: RegExp
    }
}

export type DictionaryContent = {
    key: string
    label: string
    category?: string
    form?: DictionaryForm
}

export type DictionaryContentFields = keyof DictionaryContent

export type Dictionary = {
    identifier: string
    web: {
        contents: DictionaryContent[]
    }
}
