import { Express, NextFunction } from "express"

export const errorPromise = (
    req: Express.Request,
    res: Express.Response,
    next: NextFunction,
    func: (req: Express.Request, res: Express.Response, next: NextFunction) => Promise<void>,
) => {
    // https://expressjs.com/en/guide/error-handling.html
    return Promise.resolve()
        .then(() => func(req, res, next))
        .catch(next) // Errors will be passed to Express.
}
