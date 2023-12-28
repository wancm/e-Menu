import { GLOBAL_CONSTANTS } from "@libs/global-constants"
import { ClientInfo } from "@libs/server/types/clilent-info"
import { ClientInfoService } from "@libs/server/types/services/client-info.service"
import { getBrowserLanguage, getIp } from "@libs/shared/utils/express-util"
import express from "express"

export const getCountry = (): string | undefined => {
    // temp hardcoded to Malaysia
    return "MY"
}

export class ClientInfoServiceLogicExpress implements ClientInfoService {
    get(req: any): ClientInfo | undefined {
        req = <express.Request>req

        if (req) {
            const clientInfoFromMiddleware = req.get(GLOBAL_CONSTANTS.HTTP_HEADER.CLIENT_INFO)

            if (clientInfoFromMiddleware) {
                return clientInfoFromMiddleware as ClientInfo
            }

            return {
                ip: getIp(req),
                countryCode: getCountry(),
                preferredLanguages: getBrowserLanguage(req),
            }
        }

        return undefined
    }
}
