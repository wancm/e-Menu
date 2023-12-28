import { Product } from "@libs/shared/types/product"
import { ObjectId } from "mongodb"

export type ProductRepository = {
    loadOneAsync(objId: ObjectId): Promise<Product>

    loadByBusinessUnitIdAsync(businessUnitId: ObjectId): Promise<Product[]>

    saveAsync(product: Product, createdBy: string): Promise<ObjectId>
}
