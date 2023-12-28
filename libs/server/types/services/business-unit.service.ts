import { factory } from "@libs/server/factory"
import { BusinessUnitsRepository } from "@libs/server/types/repositories/business-units-repository"
import { SessionService } from "@libs/server/types/services/session-service"
import { testHelper } from "@libs/shared/utils/test-helper"
import {
    BusinessUnitRegisterRequest,
    BusinessUnitRegisterResponse,
} from "./types/business-unit-register"

export class BusinessUnitService {
    constructor(
        private readonly businessUnitRepository: BusinessUnitsRepository,
        private readonly sessionService: SessionService,
    ) {}

    async registerAsync(req: BusinessUnitRegisterRequest): Promise<BusinessUnitRegisterResponse> {
        if (req.name?.isNilOrEmpty()) {
        }

        return { id: "" }
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest
    describe("#business-unit-service.ts", () => {
        const service = new BusinessUnitService(
            factory.businessUnitRepository(),
            factory.sessionService(),
        )

        const test1 = ".registerAsync()"
        test(test1, async () => {
            console.time(test1)

            const objectId = await service.registerAsync({
                name: testHelper.generateRandomString(10),
            })

            console.timeEnd(test1)
        })
    })
}
