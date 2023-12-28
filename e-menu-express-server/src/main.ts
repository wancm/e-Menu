import "dotenv/config"
import { corsOptions } from "@/cors-Options"
import { AppSettings } from "@libs/app-settings"
import { GLOBAL_CONSTANTS } from "@libs/global-constants"
import { factory } from "@libs/server/factory"
import { getLocalData } from "@libs/shared/types/services/app-http-client"
import cors from "cors"
import express from "express"
import startupRouter from "./routes/startup"

console.log(`Starting e-Menu express server: ${process.env.ENVIRONMENT}`)

const app = express()

app.use(cors()) // enable all CORS requests
app.options("*.*", cors()) // enable pre-flight request for DELETE

/** https://masteringjs.io/tutorials/express/express-json
 * express.json() is a built-in middleware function in Express starting from v4.16.0.
 * It parses incoming JSON requests and puts the parsed data in req.body.
 * Without `express.json()`, `req.body` is undefined.
 * */
app.use(express.json())

/** app.use(express.json({ limit: 10 }));
 * The limit option allows you to specify the size of the request body.
 * Whether you input a string or a number, it will be interpreted as the maximum size of the payload in bytes.
 * */

/** https://www.geeksforgeeks.org/express-js-express-urlencoded-function/
 * The express.urlencoded() function is a built-in middleware function in Express.
 * It parses incoming requests with URL-encoded payloads and is based on a body parser.
 *
 * POST request to http://localhost:3000/ with header set to ‘content-type: application/x-www-form-urlencoded’
 * and body {“name”:”GeeksforGeeks”}, then you will see the following output on your console:
 * [Object: null prototype] { { name: 'GeeksforGeeks' } : '' }
 *
 * */
app.use(express.urlencoded({ extended: false }))

app.use("/startup", startupRouter)

app.get("/", async (req, res) => {
    res.jsonp(AppSettings.instance)
})

app.get("/info", async (req, res) => {
    const clientInfo = factory.clientInfoService().get(req)
    const data = await factory.masterDataRepository().loadAppSettingsAsync()
    const response = {
        message: "e-Menu express server",
        environment: process.env.ENVIRONMENT,
        clientInfo,
        appSettings: AppSettings.instance,
        data,
    }

    res.jsonp(response)
})

app.post("/", function (req, res) {
    // Without `express.json()`, `req.body` is undefined.
    console.log(`${req.body}`)
})

app.use(async (err: any, req: any, res: any, next: any) => {
    // logic
    res.status(500)
    //res.render("error", { error: err })

    if (AppSettings.instance.isProd) {
        res.json({
            status: 500,
            message: "Internal Server Error",
        })
    } else {
        res.json({
            status: 500,
            message: err.message,
            stack: err.stack,
        })
    }
})

app.listen(GLOBAL_CONSTANTS.EXPRESS_PORT, async () => {
    console.log(
        `e-Menu express server app listening on port ${GLOBAL_CONSTANTS.EXPRESS_PORT}!`,
    )

    await getLocalData("/startup") //
        .then((data) => {
            console.log(data.message)
        })
})
