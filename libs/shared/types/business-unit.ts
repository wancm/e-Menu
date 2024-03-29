import { AppSettings } from "@libs/app-settings"
import { MongoDbUtil } from "@libs/server/data/mongodb/mongodb-util"
import { AppDateUtil } from "@libs/shared/utils/app-date-util"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

// https://zzdjk6.medium.com/typescript-zod-and-mongodb-a-guide-to-orm-free-data-access-layers-f83f39aabdf3

export const BusinessUnitEntitySchema = z.object({
    _id: z.instanceof(ObjectId),
    name: z.string().max(100).min(3),
    createdBy: z.instanceof(ObjectId),
    createdDate: z.date().default(AppDateUtil.utcNowToDate()),
    updatedBy: z.string().max(100).optional(),
    updatedDate: z.date().default(AppDateUtil.utcNowToDate()).optional(),
    _ts: z.number().default(AppDateUtil.utcNowUnixMilliseconds),
})

// Database Entities
export type BusinessUnitEntity = z.infer<typeof BusinessUnitEntitySchema>

// https://zzdjk6.medium.com/typescript-zod-and-mongodb-a-guide-to-orm-free-data-access-layers-f83f39aabdf3

// Application DTO
export const BusinessUnitDTOSchema = z.object({
    id: z.string().optional(),
    name: z.string().nullish(),
})

export type BusinessUnit = z.infer<typeof BusinessUnitDTOSchema>

export const businessUnitConverter = {
    toEntity(dto: BusinessUnit, createdBy?: string): BusinessUnitEntity {
        const entity = {
            _id: MongoDbUtil.genId(dto.id),
            name: dto.name,
            createdBy: createdBy
                ? MongoDbUtil.genIdIfNotNil(createdBy)
                : MongoDbUtil.genIdIfNotNil(AppSettings.instance.systemId),
        }

        const result = BusinessUnitEntitySchema.safeParse(entity)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("BusinessUnitEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: BusinessUnitEntity): BusinessUnit {
        const dto: BusinessUnit = {
            id: entity._id.toHexString(),
            name: entity.name,
        }

        const result = BusinessUnitDTOSchema.safeParse(dto)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("BusinessUnitDTOSchema validation error")
            /* c8 ignore end */
        }
    },
}
