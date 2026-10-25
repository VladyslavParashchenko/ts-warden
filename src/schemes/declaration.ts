import { z } from "zod"
import { countSchema, nameRulesSchema } from "./common.js"

/** Constraints on top-level declarations of a file: classes or functions. */
export const declarationRulesShape = {
    count: countSchema.optional(),
    name: nameRulesSchema.optional(),
    export: z.enum(["named"]).optional(),
}

export type DeclarationRules = z.infer<z.ZodObject<typeof declarationRulesShape>>
