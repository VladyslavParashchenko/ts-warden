import type { SourceFile } from "ts-morph"
import type { RulesFile } from "../schemes/index.js"
import { classRules } from "./classes/index.js"
import { fileNameRule } from "./file-name.js"
import { functionRules } from "./functions/index.js"
import type { Issue, Rule } from "./types.js"

export type { Issue, Rule } from "./types.js"

/** Runs `rules` and prefixes rule ids with the config section, e.g. `classes.name`. */
function runSection<T>(file: SourceFile, section: string, rules: Rule<T>[], config: T): Issue[] {
    return rules
        .flatMap((rule) => rule(file, config))
        .map((issue) => ({ ...issue, rule: `${section}.${issue.rule}` }))
}

export function checkFile(file: SourceFile, rules: RulesFile): Issue[] {
    return [
        ...fileNameRule(file, rules),
        ...(rules.classes ? runSection(file, "classes", classRules, rules.classes) : []),
        ...(rules.functions ? runSection(file, "functions", functionRules, rules.functions) : []),
    ]
}
