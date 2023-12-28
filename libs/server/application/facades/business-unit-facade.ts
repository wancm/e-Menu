import { appSettings } from "@libs/app-settings"
import { factory } from "@libs/server/factory"
import { BusinessUnitsRepository } from "@libs/server/types/repositories/business-units-repository"
import { SessionService } from "@libs/server/types/services/session-service"
import { BusinessUnit, BusinessUnitDTOSchema } from "@libs/shared/types/business-unit"
import { testHelper } from "@libs/shared/utils/test-helper"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

const RegisterParamSchema = z.object({
    name: BusinessUnitDTOSchema.shape.name,
    admin: z.object({
        lastName: z.string().optional(),
        email: z.string(),
    }),
})

type RegisterParam = z.infer<typeof RegisterParamSchema>

export class BusinessUnitFacade {
    constructor(
        private readonly businessUnitRepository: BusinessUnitsRepository,
        private readonly sessionService: SessionService,
    ) {}

    async registerAsync(param: RegisterParam): Promise<string> {
        const result = RegisterParamSchema.safeParse(param)

        if (!result.success) {
            /* c8 ignore start */
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("RegisterParamSchema validation error")
            /* c8 ignore end */
        }

        param = result.data
        const newBusinessUnit: BusinessUnit = {
            name: param.name,
        }

        return await this.businessUnitRepository.saveAsync(newBusinessUnit, appSettings.systemId)
    }
}

if (import.meta.vitest) {
    const { describe, test } = import.meta.vitest

    describe("# business-unit-facade.ts", () => {
        const facade = new BusinessUnitFacade(
            factory.businessUnitRepository(),
            factory.sessionService(),
        )

        const test1 = ".registerAsync()"
        test(test1, async () => {
            console.time(test1)

            const objectId = await facade.registerAsync({
                name: testHelper.generateRandomString(10),
                admin: {
                    email: testHelper.generateRandomString(10),
                },
            })

            console.timeEnd(test1)
        })
    })
}
