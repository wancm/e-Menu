import { ClientInfo } from "@libs/server/types/clilent-info"

export type ClientInfoService = {
    get(req: any): ClientInfo | undefined
}
