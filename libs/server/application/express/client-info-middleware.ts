import { ClientInfoServiceLogicExpress } from "@libs/server/logic/client-info/client-info-service.logic"
import express from "express"

export const clientInfoMiddleware = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    ;(<any>req).clientInfo = new ClientInfoServiceLogicExpress().get(req)
    next()
}
