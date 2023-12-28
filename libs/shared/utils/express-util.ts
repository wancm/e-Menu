import express from "express"

// static method that returns a string by reading from express req "accept-language" header
export const getBrowserLanguage = (
    //
    req: express.Request,
): string[] | undefined => {
    //
    // https://nbellocam.dev/blog/next-middleware-i18n
    return req
        ?.get("accept-language")
        ?.split(",")
        .map((i) => i.split(";"))
        ?.reduce(
            (ac: { code: string; priority: string }[], lang) => [
                ...ac,
                { code: lang[0], priority: lang[1] },
            ],
            [],
        )
        ?.sort((a, b) => (a.priority > b.priority ? -1 : 1))
        ?.map((i) => i.code.substring(0, 2))
}

// method to return ip address from express req
export const getIp = (req: express.Request): string | undefined => {
    // https://stackoverflow.com/questions/68338838/how-to-get-the-ip-address-of-the-client-from-server-side-in-next-js-app
    return req?.get("x-real-ip") || req?.get("x-forwarded-for") || req?.ip
}
