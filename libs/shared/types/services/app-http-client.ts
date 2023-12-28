// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

import { GLOBAL_CONSTANTS } from "@libs/global-constants"
import { ApiResponse } from "@libs/shared/types/api-models"
import { AppUtil } from "@libs/shared/utils/app-util"

export async function getLocalData<T>(path?: string): Promise<ApiResponse<T>> {
    const url = `http://localhost:${GLOBAL_CONSTANTS.EXPRESS_PORT}`
    let response = undefined

    if (AppUtil.isStrEmpty(path)) response = await getData(url)
    else response = await getData(`${url}${path}`)

    if (response) {
        return {
            status: 200,
            data: response,
        }
    }

    return {
        status: 200,
    }
}

export async function getData(url: string): Promise<any> {
    const response: Response = await fetch(url)

    // https://stackoverflow.com/questions/37121301/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
        // The response was a JSON object
        // Process your data as a JavaScript object
        return await response.json()
    } else {
        // The response wasn't a JSON object
        // Process your text as a String
        return await response.text()
    }
}

export async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    return response.json() // parses JSON response into native JavaScript objects
}
