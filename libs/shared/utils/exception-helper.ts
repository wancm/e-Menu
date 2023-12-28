class ExceptionHelper {
    argumentNullMessage(param: string) {
        const message = "Invalid @param is nil or empty."
        if (param.isNilOrEmpty()) return message
        return `${message} [${param}]`
    }
}

export const excHelper = new ExceptionHelper()
