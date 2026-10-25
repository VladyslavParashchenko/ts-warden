import { z } from "zod"

/** A number means an exact value; an object sets an inclusive range. */
export const countSchema = z.union([
    z.number().int().nonnegative(),
    z
        .strictObject({
            min: z.number().int().nonnegative().optional(),
            max: z.number().int().nonnegative().optional(),
        })
        .refine((range) => range.min !== undefined || range.max !== undefined, {
            message: "Range must set at least one of `min` or `max`",
        }),
])

export type Count = z.infer<typeof countSchema>

export const nameListSchema = z.array(z.string().min(1)).min(1)

const regexSchema = z.string().refine(
    (pattern) => {
        try {
            new RegExp(pattern)
            return true
        } catch {
            return false
        }
    },
    { message: "Invalid regular expression" },
)

/** Every set option must hold: `endsWith` a suffix, `matches` a regex, `oneOf` a list of names. */
export const nameRulesSchema = z.strictObject({
    endsWith: z.string().min(1).optional(),
    matches: regexSchema.optional(),
    oneOf: nameListSchema.optional(),
})

export type NameRules = z.infer<typeof nameRulesSchema>

/** `allOf` — every listed decorator is required; `oneOf` — exactly one of them. */
export const decoratorsSchema = z
    .strictObject({
        allOf: nameListSchema.optional(),
        oneOf: nameListSchema.optional(),
    })
    .refine((rules) => rules.allOf !== undefined || rules.oneOf !== undefined, {
        message: "Set at least one of `allOf` or `oneOf`",
    })

export type DecoratorRules = z.infer<typeof decoratorsSchema>
