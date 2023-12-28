import { Shop } from "@libs/shared/types/shop"
import { ObjectId } from "mongodb"

export type ShopsRepository = {
    loadOneAsync(objId: ObjectId): Promise<Shop>

    loadByBusinessUnitIdAsync(businessUnitId: ObjectId): Promise<Shop[]>

    saveAsync(shop: Shop, createdBy: string): Promise<ObjectId>
}
