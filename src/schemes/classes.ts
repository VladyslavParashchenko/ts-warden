import { z } from "zod"
import { callableRulesShape } from "./callable.js"
import { countSchema, decoratorsSchema, nameListSchema } from "./common.js"
import { declarationRulesShape } from "./declaration.js"

export const methodRulesSchema = z.strictObject({
    ...callableRulesShape,
    count: countSchema.optional(),
    decorators: decoratorsSchema.optional(),
    static: z.boolean().optional(),
})

export type MethodRules = z.infer<typeof methodRulesSchema>

export const methodScopes = ["public", "protected", "private", "all"] as const

export type MethodScopeKey = (typeof methodScopes)[number]

export const classRulesSchema = z.strictObject({
    ...declarationRulesShape,
    implements: nameListSchema.optional(),
    decorators: decoratorsSchema.optional(),
    methods: z
        .strictObject({
            public: methodRulesSchema.optional(),
            protected: methodRulesSchema.optional(),
            private: methodRulesSchema.optional(),
            all: methodRulesSchema.optional(),
        })
        .optional(),
})

export type ClassRules = z.infer<typeof classRulesSchema>
