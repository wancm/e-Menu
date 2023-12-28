import "@libs/shared/extension-methods"
import { Dictionary, DictionaryContent, DictionaryForm } from "@libs/shared/types/dictionary"

export class DictionaryHandler {
    private labelVal: string | undefined
    private categoryVal: string | undefined
    private formVal: DictionaryForm | undefined

    get label(): string {
        if (this.labelVal) return this.labelVal
        this.labelVal = this.getContent()?.label ?? ""
        return this.labelVal
    }

    /** current this field not in use, may we could find a better use for this later */
    get category(): string {
        if (this.categoryVal) return this.categoryVal
        this.categoryVal = this.getContent()?.category ?? ""
        return this.categoryVal
    }

    get form(): DictionaryForm | undefined {
        if (this.formVal) return this.formVal
        this.formVal = this.getContent()?.form
        return this.formVal
    }

    constructor(
        public dictionary: Dictionary | undefined,
        public key: string,
    ) {}

    getContent(): DictionaryContent | undefined {
        if (!this.dictionary?.web?.contents) return undefined
        return this.dictionary.web.contents.find((c) => (c.key ? c.key?.isEqual(this.key) : false))
    }
}
