import type { NameRules } from "../../schemes/index.js"

/** Describes how `name` breaks `rules`, e.g. `must end with "Controller"`. */
export function checkName(name: string, rules: NameRules): string[] {
    const problems: string[] = []
    if (rules.endsWith !== undefined && !name.endsWith(rules.endsWith)) {
        problems.push(`must end with "${rules.endsWith}"`)
    }
    if (rules.matches !== undefined && !new RegExp(rules.matches).test(name)) {
        problems.push(`must match /${rules.matches}/`)
    }
    if (rules.oneOf !== undefined && !rules.oneOf.includes(name)) {
        problems.push(`must be one of ${rules.oneOf.join(", ")}`)
    }
    return problems
}
