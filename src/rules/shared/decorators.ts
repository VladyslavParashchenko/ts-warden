import type { DecoratorRules } from "../../schemes/index.js"

const formatList = (names: string[]) => names.map((name) => `@${name}`).join(", ")

/** Describes how `present` decorators break `rules`, e.g. `is missing @Controller`. */
export function checkDecorators(present: string[], rules: DecoratorRules): string[] {
    const problems: string[] = []

    if (rules.allOf) {
        const missing = rules.allOf.filter((name) => !present.includes(name))
        if (missing.length > 0) problems.push(`is missing ${formatList(missing)}`)
    }

    if (rules.oneOf) {
        const { oneOf } = rules
        const found = present.filter((name) => oneOf.includes(name))
        if (found.length !== 1) {
            problems.push(
                `must have exactly one of ${formatList(oneOf)}, ` +
                    `found ${found.length > 0 ? formatList(found) : "none"}`,
            )
        }
    }
    return problems
}
