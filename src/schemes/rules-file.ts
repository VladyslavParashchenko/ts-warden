import { z } from "zod"
import { classRulesSchema } from "./classes.js"
import { countSchema } from "./common.js"
import { functionRulesSchema } from "./functions.js"

export const rulesFileSchema = z
    .strictObject({
        /** File name derived from a top-level class or function name. */
        fileName: z.enum(["kebab-case"]).optional(),
        /** Number of lines in the file. */
        fileLines: countSchema.optional(),
        classes: classRulesSchema.optional(),
        functions: functionRulesSchema.optional(),
    })
    .refine((file) => Object.values(file).some((rules) => rules !== undefined), {
        message: "Set at least one of `fileName`, `fileLines`, `classes` or `functions`",
    })

export type RulesFile = z.infer<typeof rulesFileSchema>
