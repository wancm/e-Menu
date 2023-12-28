import { BusinessUnit } from "@libs/shared/types/business-unit"

export type BusinessUnitsRepository = {
    loadOneAsync(id: string): Promise<BusinessUnit>

    loadManyAsync(ids: string[]): Promise<BusinessUnit[]>

    saveAsync(businessUnit: BusinessUnit, createdBy: string): Promise<string>
}
