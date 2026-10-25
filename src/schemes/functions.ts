import { z } from "zod"
import { callableRulesShape } from "./callable.js"
import { declarationRulesShape } from "./declaration.js"

export const functionRulesSchema = z.strictObject({
    ...callableRulesShape,
    ...declarationRulesShape,
})

export type FunctionRules = z.infer<typeof functionRulesSchema>
