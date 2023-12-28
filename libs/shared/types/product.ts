import { AppSettings } from "@libs/app-settings"
import { MongoDbUtil } from "@libs/server/data/mongodb/mongodb-util"
import { AppImageDtoSchema, AppImageEntitySchema, imageConverter } from "@libs/shared/types/image"
import { AppDateUtil } from "@libs/shared/utils/app-date-util"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

// Database Entities
export const ProductEntitySchema = z.object({
    _id: z.instanceof(ObjectId),
    businessUnitId: z.instanceof(ObjectId),
    name: z.string().max(100).min(3),
    code: z.string().max(20).optional(),
    price: z.number().default(0),
    currencyCode: z.string().max(3),
    isDeleted: z.boolean().default(false),
    image: AppImageEntitySchema.optional(),
    childProductIds: z.array(z.instanceof(ObjectId)).optional(),
    /**
     * Flag to determine if it's select-able option when play as a child product.
     */
    isSelectable: z.boolean().optional(),
    /**
     * Price when play as a child product.
     */
    childPrice: z.number().optional(),
    createdBy: z.instanceof(ObjectId),
    createdDate: z.date().default(AppDateUtil.utcNowToDate()),
    updatedBy: z.instanceof(ObjectId).optional(),
    updatedDate: z.date().default(AppDateUtil.utcNowToDate()).optional(),
    _ts: z.number().default(AppDateUtil.utcNowUnixMilliseconds()),
})

export type ProductEntity = z.infer<typeof ProductEntitySchema>

// Application DTO
export const ProductDtoSchema = z.object({
    id: z.string().optional(),
    businessUnitId: z.string(),
    name: z.string().nullish(),
    code: z.string().nullish(),
    price: z.number().nullish(),
    currencyCode: z.string().nullish(),
    isDeleted: z.boolean().nullish(),
    image: AppImageDtoSchema.nullish(),
    childProductIds: z.array(z.string()).nullish(),
    isSelectable: z.boolean().nullish(),
    childPrice: z.number().nullish(),
})

export type Product = z.infer<typeof ProductDtoSchema>

export const productConverter = {
    toEntity(dto: Product, createdBy: string): ProductEntity {
        const entity = {
            _id: MongoDbUtil.genId(dto.id),
            businessUnitId: dto.businessUnitId.toObjectId(),
            name: dto.name,
            code: dto.code,
            price: dto.price,
            currencyCode: dto.currencyCode,
            isDeleted: dto.isDeleted,
            image: dto.image ? imageConverter.toEntity(dto.image) : undefined,
            childProductIds: dto.childProductIds
                ? dto.childProductIds.map((id) => id.toObjectId())
                : [],
            isSelectable: dto.isSelectable,
            childPrice: dto.childPrice,
            createdBy: createdBy
                ? MongoDbUtil.genIdIfNotNil(createdBy)
                : MongoDbUtil.genIdIfNotNil(AppSettings.instance.systemId),
        }

        const result = ProductEntitySchema.safeParse(entity)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ProductEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: ProductEntity): Product {
        const dto: Product = {
            id: entity._id.toHexString(),
            businessUnitId: entity.businessUnitId.toHexString(),
            name: entity.name,
            code: entity.code,
            price: entity.price,
            currencyCode: entity.currencyCode,
            isDeleted: entity.isDeleted,
            image: entity.image ? imageConverter.toDTO(entity.image) : undefined,
            childProductIds: entity.childProductIds
                ? entity.childProductIds.map((id) => id.toHexString())
                : [],
            isSelectable: entity.isSelectable,
            childPrice: entity.childPrice,
        }

        const result = ProductDtoSchema.safeParse(dto)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ProductDtoSchema validation error")
            /* c8 ignore end */
        }
    },
}
