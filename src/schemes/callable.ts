import { z } from "zod"
import { countSchema, nameRulesSchema } from "./common.js"

/** Constraints shared by methods and functions. */
export const callableRulesShape = {
    name: nameRulesSchema.optional(),
    params: countSchema.optional(),
    async: z.boolean().optional(),
    returnType: z.enum(["explicit"]).optional(),
    lines: countSchema.optional(),
}

export type CallableRules = z.infer<z.ZodObject<typeof callableRulesShape>>
