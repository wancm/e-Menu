import { BusinessUnitBuilder } from "@libs/server/logic/types/builders"
import { BusinessUnit } from "@libs/shared/types/business-unit"
import { Person } from "@libs/shared/types/person"
import { ObjectId } from "mongodb"

export class CommonBusinessUnitBuilder implements BusinessUnitBuilder {
    private businessUnit?: BusinessUnit

    load(id: ObjectId): BusinessUnit {
        // load from database
        return {}
    }

    build(name: string): BusinessUnit {
        return this.businessUnit ?? {}
    }

    addPerson = (person: Person) => {}
}
