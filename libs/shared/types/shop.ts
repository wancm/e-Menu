import { AppSettings } from "@libs/app-settings"
import { MongoDbUtil } from "@libs/server/data/mongodb/mongodb-util"
import {
    addressConverter,
    AddressDtoSchema,
    AddressEntitySchema,
} from "@libs/shared/types/contacts"
import { AppDateUtil } from "@libs/shared/utils/app-date-util"
import { AppUtil } from "@libs/shared/utils/app-util"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

export const ShopEntitySchema = z.object({
    _id: z.instanceof(ObjectId),
    businessUnitId: z.instanceof(ObjectId),
    name: z.string().max(100).min(3),
    personIds: z.array(z.instanceof(ObjectId)).optional(),
    productIds: z.array(z.instanceof(ObjectId)).optional(),
    address: AddressEntitySchema,
    createdBy: z.instanceof(ObjectId),
    createdDate: z.date().default(AppDateUtil.utcNowToDate()),
    updatedBy: z.string().max(100).optional(),
    updatedDate: z.date().default(AppDateUtil.utcNowToDate()).optional(),
    _ts: z.number().default(AppDateUtil.utcNowUnixMilliseconds()),
})

// Database Entities
export type ShopEntity = z.infer<typeof ShopEntitySchema>

// Application DTO
export const ShopDTOSchema = z.object({
    id: z.string().optional(),
    businessUnitId: z.string(),
    name: z.string().nullish(),
    personIds: z.array(z.string()).nullish(),
    productIds: z.array(z.string()).nullish(),
    address: AddressDtoSchema.optional(),
})

export type Shop = z.infer<typeof ShopDTOSchema>

export const shopConverter = {
    toEntity(dto: Shop, createdBy: string): ShopEntity {
        const entity = {
            _id: MongoDbUtil.genId(dto.id),
            businessUnitId: dto.businessUnitId.toObjectId(),
            name: dto.name,
            personIds: dto.personIds?.map((id) => id.toObjectId()),
            productIds: !AppUtil.isArrEmpty(dto.productIds)
                ? dto.productIds.map((id) => id.toObjectId())
                : [],
            address: addressConverter.toEntity(dto.address),
            createdBy: createdBy
                ? MongoDbUtil.genIdIfNotNil(createdBy)
                : MongoDbUtil.genIdIfNotNil(AppSettings.instance.systemId),
        }

        const result = ShopEntitySchema.safeParse(entity)
        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ShopEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: ShopEntity): Shop {
        const dto: Shop = {
            id: entity._id.toHexString(),
            businessUnitId: entity.businessUnitId.toHexString(),
            name: entity.name,
            personIds: entity.personIds?.map((id) => id.toHexString()),
            productIds: entity.productIds?.map((id) => id.toHexString()),
            address: addressConverter.toDTO(entity.address),
        }

        const result = ShopDTOSchema.safeParse(dto)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ShopDTOSchema validation error")
            /* c8 ignore end */
        }
    },
}
