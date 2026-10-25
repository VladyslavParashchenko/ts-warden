import type { FunctionRules } from "../../schemes/index.js"
import { getFileFunctions } from "../../utils/declarations.js"
import { checkCallable } from "../shared/callable.js"
import { checkDeclarations } from "../shared/declarations.js"
import type { Rule } from "../types.js"

const declarationsRule: Rule<FunctionRules> = (file, rules) => {
    const declarations = getFileFunctions(file).map((fn) => fn.declaration)
    return checkDeclarations(file, declarations, rules, "Functions in file")
}

// `name` is already checked as a declaration rule.
const callableRule: Rule<FunctionRules> = (file, rules) =>
    getFileFunctions(file).flatMap((fn) =>
        checkCallable(fn.callable, rules, "Function", { checkName: false }),
    )

export const functionRules: Rule<FunctionRules>[] = [declarationsRule, callableRule]
