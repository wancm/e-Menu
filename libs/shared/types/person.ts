import { AppSettings } from "@libs/app-settings"
import { MongoDbUtil } from "@libs/server/data/mongodb/mongodb-util"
import { BusinessUnitDTOSchema } from "@libs/shared/types/business-unit"
import {
    contactConverter,
    ContactDtoSchema,
    ContactEntitySchema,
} from "@libs/shared/types/contacts"
import { AppDateUtil } from "@libs/shared/utils/app-date-util"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

export enum PersonTypes {
    Undefined = "Undefined",
    Internal = "Internal",
    Member = "Member",
    Guest = "Guest",
}

export const PersonEntitySchema = z.object({
    _id: z.instanceof(ObjectId),
    businessUnitId: z.instanceof(ObjectId),
    email: z.string().max(200),
    password: z.string().max(300).optional(),
    lastName: z.string().max(100).optional(),
    firstName: z.string().max(100).optional(),
    dateOfBirth: z.date().optional(),
    contact: ContactEntitySchema.optional(),
    type: z.nativeEnum(PersonTypes),
    createdBy: z.instanceof(ObjectId),
    createdDate: z.date().default(AppDateUtil.utcNowToDate()),
    updatedBy: z.instanceof(ObjectId).optional(),
    updatedDate: z.date().default(AppDateUtil.utcNowToDate()).optional(),
    _ts: z.number().default(AppDateUtil.utcNowUnixMilliseconds()),
})

// Database Entities
export type PersonEntity = z.infer<typeof PersonEntitySchema>

export const PersonDtoSchema = z.object({
    id: z.string().optional(),
    businessUnitId: z.string(),
    businessUnit: BusinessUnitDTOSchema.optional(),
    email: z.string().nullish(),
    password: z.string().nullish(),
    lastName: z.string().nullish(),
    firstName: z.string().nullish(),
    dateOfBirth: z.date().nullish(),
    contact: ContactDtoSchema.nullish(),
    type: z.nativeEnum(PersonTypes).optional(),
})

// Application DTO
export type Person = z.infer<typeof PersonDtoSchema>

export const personConverter = {
    toEntity(dto: Person, createdBy?: string): PersonEntity {
        const entity = {
            _id: MongoDbUtil.genId(dto.id),
            businessUnitId: dto.businessUnitId.toObjectId(),
            email: dto.email,
            lastName: dto.lastName,
            firstName: dto.firstName,
            dateOfBirth: dto.dateOfBirth,
            contact: dto.contact ? contactConverter.toEntity(dto.contact) : undefined,
            type: dto.type,
            createdBy: createdBy
                ? MongoDbUtil.genIdIfNotNil(createdBy)
                : MongoDbUtil.genIdIfNotNil(AppSettings.instance.systemId),
        }

        const result = PersonEntitySchema.safeParse(entity)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("PersonEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: PersonEntity): Person {
        const dto: Person = {
            id: entity._id.toHexString(),
            businessUnitId: entity.businessUnitId.toHexString(),
            email: entity.email,
            lastName: entity.lastName,
            firstName: entity.firstName,
            dateOfBirth: entity.dateOfBirth,
            contact: entity.contact ? contactConverter.toDTO(entity.contact) : undefined,
            type: entity.type,
        }

        const result = PersonDtoSchema.safeParse(dto)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("PersonDTOSchema validation error")
            /* c8 ignore end */
        }
    },
}
